import { Connection, PublicKey } from "@solana/web3.js";
import SDK from "../../sdk/dist";

type GameData = {
    player1: PublicKey;
    player2: PublicKey;
    secretNumber: number;
    currentPlayer: PublicKey;
    gameState: any;
    winner: PublicKey | null;
    game: PublicKey;
};
class Indexer {
    data: GameData[];
    sdk: SDK;
    id: number;
    constructor(sdk: SDK) {
        this.data = [];
        this.sdk = sdk;
        this.id = -1;
    }
    async init() {
        setInterval(async () => {
            await this.refresh();
        }, 300_000);
    }
    async refresh() {
        this.data = [];
        
        try {
            await this.sdk.program.removeEventListener(this.id);
        } catch (e) {}

        const accounts = await this.sdk.getAllGames();
        for (const account of accounts) {
            this.data.push(account.account);
        }

        console.log("Fetched all games", this.data);

        await this.setupEventListener();
    }
    async setupEventListener() {
        this.id = await this.sdk.onGameUpdated((event) => {
            console.log("Game updated", event);
            const updatedGame = this.data.find((game) => game.game.equals(event.game));
            if (updatedGame) {
                updatedGame.gameState = event.gameState;
                updatedGame.currentPlayer = event.currentPlayer;
                updatedGame.winner = event.winner;
            }
        });
    }
}

(async () => {
    const sdk = SDK.buildWithNoWallet({
        connection: new Connection('http://localhost:8899'),
    });
    const indexer = new Indexer(sdk);

    // set up manual timer to refresh accounts every 5 minutes
    await indexer.init();

    // fetch all games 
    // listen to game updates to update accounts in real time
    await indexer.refresh();
})();