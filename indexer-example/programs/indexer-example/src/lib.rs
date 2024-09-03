use anchor_lang::prelude::*;

declare_id!("8kwhCLtDn37GDLYPWdCTyPSVyi8fUdq5x3X7PhFCnxEV");

#[program]
pub mod indexer_example {
    use super::*;

    pub fn initialize_game(ctx: Context<InitializeGame>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        
        // set player 1 and player 2
        game.player_1 = ctx.accounts.player_1.key();
        game.player_2 = ctx.accounts.player_2.key();

        // set the number to guess
        // get the clock value and scale it down to a number between 0 and 100
        let clock = Clock::get()?;
        game.secret_number = (clock.unix_timestamp as u8) % 100;

        // set the current player to player 2
        game.current_player = ctx.accounts.player_2.key();

        // set the game state to active
        game.game_state = GameState::Active;

        // set game
        game.game = game.key();

        // emit the game updated event
        emit!(GameUpdated {
            game: game.key(),
            game_state: game.game_state,
            current_player: game.current_player,
            winner: game.winner,
        });

        Ok(())
    }

    pub fn make_guess(ctx: Context<MakeGuess>, guess: u8) -> Result<()> {
        let game = &mut ctx.accounts.game;

        // check if the game is still active
        require!(game.game_state == GameState::Active, ErrorCode::GameEnded);

        // check if the guesser is the current player
        require!(
            game.current_player == *ctx.accounts.guesser.key,
            ErrorCode::NotPlayersTurn
        );

        // handle correct guess
        if guess == game.secret_number {
            // set the game state to ended
            game.game_state = GameState::Ended;

            // set the winner to the current player
            game.winner = Some(game.current_player);

            msg!("Player {} won!", game.current_player);
        } else {
            // switch the current player to the other player
            game.current_player = if game.current_player == game.player_1 {
                game.player_2
            } else {
                game.player_1
            };
            msg!("Incorrect guess. Next player's turn.");
        }

        // emit the game updated event
        emit!(GameUpdated {
            game: game.key(),
            game_state: game.game_state,
            current_player: game.current_player,
            winner: game.winner,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(
        init, 
        payer = player_1, 
        space = 8 + GameData::INIT_SPACE
    )]
    pub game: Account<'info, GameData>,
    #[account(mut)]
    pub player_1: Signer<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    pub player_2: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeGuess<'info> {
    #[account(mut)]
    pub game: Account<'info, GameData>,
    pub guesser: Signer<'info>,
}

#[account]
#[derive(Default, InitSpace, Copy)]
pub struct GameData {
    pub player_1: Pubkey,
    pub player_2: Pubkey,
    pub secret_number: u8,
    pub current_player: Pubkey,
    pub game_state: GameState,
    pub winner: Option<Pubkey>,
    pub game: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace, Copy)]
pub enum GameState {
    Active,
    Ended,
}
impl Default for GameState {
    fn default() -> Self {
        GameState::Active
    }
}
#[error_code]
pub enum ErrorCode {
    #[msg("The game has already ended")]
    GameEnded,
    #[msg("It's not your turn to make a guess")]
    NotPlayersTurn,
}
#[event]
pub struct GameUpdated {
    pub game: Pubkey,
    pub game_state: GameState,
    pub current_player: Pubkey,
    pub winner: Option<Pubkey>,
}