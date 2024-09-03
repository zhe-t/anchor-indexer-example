import * as anchor from "@coral-xyz/anchor";
import SDK from "../../sdk/dist";

let provider = anchor.AnchorProvider.local();
anchor.setProvider(provider);

describe("indexer-example", () => {
  const sdk = SDK.build({
    connection: provider.connection,
    wallet: provider.wallet
  });

  const player1 = anchor.getProvider().publicKey!;
  const player2 = anchor.web3.Keypair.generate();

  it("Initializes a game", async () => {
    const game = await sdk.initializeGame({ 
      player1, 
      player2: player2.publicKey
    });
    console.log("Game initialized", game);
  });

  it("Gets a game", async () => {
    const games = await sdk.getAllGames();
    const game = await sdk.getGame(games[0].publicKey);
    console.log("Game fetched", game);
  });

  it("Listens for game updates", async () => {
    const subId = await sdk.onGameUpdated((event) => {
      console.log("Game updated", event);
      // on update, stream data to database or refetch account and save to database
    });
    console.log("Subscribed to game updates", subId);
  });

  it("Make incorrect guess", async () => {
    const game = await sdk.getAllGames();
    const tx = await sdk.makeGuess({
      game: game[0].publicKey,
      guess: 50,
      guesser: player2.publicKey,
      signers: [player2]
    });
    console.log("Incorrect guess", tx);
  });

  it("Make correct guess", async () => {
    const game = await sdk.getAllGames();
    const tx = await sdk.makeGuess({
      game: game[0].publicKey,
      guess: game[0].account.secretNumber,
      guesser: player1
    });
    console.log("Correct guess", tx);
  });
  
});
