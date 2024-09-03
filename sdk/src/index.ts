import { Commitment, Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IndexerExample } from "./types/indexer_example";
import launchdIdl from "./idl/indexer_example.json";

export type IWallet = {
    publicKey: PublicKey;
    signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
};

export default class SDK {
    public program: Program<IndexerExample>;
    public connection: Connection;
    private idl: IndexerExample = launchdIdl as unknown as IndexerExample;
    private provider: anchor.Provider;
    private wallet: IWallet;

    /**
     * Constructor
     * @param connection - Solana connection
     * @param wallet - Wallet
     * @param skipPreflight - Skip preflight
     * @param commitment - Commitment level
     * @param maxRetries - Maximum retries
     */
    private constructor(
        connection: Connection,
        wallet?: IWallet,
        skipPreflight?: boolean,
        commitment?: Commitment,
        maxRetries?: number
    ) {
        this.connection = connection;

        this.wallet =
            wallet ||
            ({
                publicKey: PublicKey.default,
                signTransaction: async (tx: Transaction | VersionedTransaction) => {
                    return tx;
                },
                signAllTransactions: async (
                    txs: Transaction[] | VersionedTransaction[]
                ) => {
                    return txs;
                },
            } as IWallet);

        this.provider = new anchor.AnchorProvider(this.connection, this.wallet, {
            commitment: commitment || "confirmed",
            maxRetries: maxRetries || 5,
            skipPreflight: skipPreflight || false,
        });

        this.program = new Program(this.idl, this.provider);
    }
    /**
     * Static build method for wallet.
     * @param param0.connection - Solana connection
     * @param param0.wallet - Wallet
     * @param param0.skipPreflight - Skip preflight
     * @param param0.commitment - Commitment level
     * @param param0.maxRetries - Maximum retries
     * @returns SDK instance
     */
    public static build({
        connection, 
        wallet, 
        skipPreflight = true, 
        commitment = "confirmed", 
        maxRetries = 5,
    }: {
        connection: Connection;
        wallet: IWallet;
        skipPreflight?: boolean;
        commitment?: Commitment;
        maxRetries?: number;
    }) {
        const sdk = new SDK(
            connection,
            wallet,
            skipPreflight,
            commitment,
            maxRetries
        );
        return sdk;
    }
    /**
     * Static build method for no wallet.
     * @param param0.connection - Solana connection
     * @returns SDK instance
     */
    public static buildWithNoWallet({ connection }: { connection: Connection; }) {
        const sdk = new SDK(connection);
        return sdk;
    }

    async initializeGame({
        player1,
        player2,
    }: {
        player1: PublicKey;
        player2: PublicKey;
    }) {
        const newGame = anchor.web3.Keypair.generate();
        const tx = await this.program.methods
            .initializeGame()
            .accountsStrict({
                game: newGame.publicKey,
                player1,
                player2,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([newGame])
            .rpc();
        console.log("Your transaction signature", tx);
        return {
            game: newGame.publicKey,
            player1,
            player2,
            signature: tx,
        };
    }
    async makeGuess({
        game,
        guess,
        guesser,
        signers,
    }: {
        game: anchor.web3.PublicKey;
        guess: number;
        guesser: anchor.web3.PublicKey;
        signers?: anchor.web3.Keypair[];
    }) {
        const tx = await this.program.methods
            .makeGuess(guess)
            .accountsStrict({
                game,
                guesser,
            })
            .signers(signers ? signers : [])
            .rpc();
        return tx;
    }

    async getGame(game: anchor.web3.PublicKey) {
        const gameAccount = await this.program.account.gameData.fetch(game);
        return gameAccount;
    }
    async onGameUpdated(callback: (event: any) => void) {
        const subId = this.program.addEventListener("gameUpdated", (event) => {
            callback(event);
        });
        return subId;
    }
    async getAllGames() {
        const games = await this.program.account.gameData.all();
        return games;
    }
}