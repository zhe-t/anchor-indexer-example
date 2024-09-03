/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/indexer_example.json`.
 */
export type IndexerExample = {
  "address": "8kwhCLtDn37GDLYPWdCTyPSVyi8fUdq5x3X7PhFCnxEV",
  "metadata": {
    "name": "indexerExample",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initializeGame",
      "discriminator": [
        44,
        62,
        102,
        247,
        126,
        208,
        130,
        215
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true,
          "signer": true
        },
        {
          "name": "player1",
          "writable": true,
          "signer": true
        },
        {
          "name": "player2"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "makeGuess",
      "discriminator": [
        59,
        189,
        219,
        87,
        240,
        211,
        125,
        101
      ],
      "accounts": [
        {
          "name": "game",
          "writable": true
        },
        {
          "name": "guesser",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "guess",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gameData",
      "discriminator": [
        237,
        88,
        58,
        243,
        16,
        69,
        238,
        190
      ]
    }
  ],
  "events": [
    {
      "name": "gameUpdated",
      "discriminator": [
        100,
        97,
        130,
        101,
        84,
        101,
        4,
        15
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "gameEnded",
      "msg": "The game has already ended"
    },
    {
      "code": 6001,
      "name": "notPlayersTurn",
      "msg": "It's not your turn to make a guess"
    }
  ],
  "types": [
    {
      "name": "gameData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player1",
            "type": "pubkey"
          },
          {
            "name": "player2",
            "type": "pubkey"
          },
          {
            "name": "secretNumber",
            "type": "u8"
          },
          {
            "name": "currentPlayer",
            "type": "pubkey"
          },
          {
            "name": "gameState",
            "type": {
              "defined": {
                "name": "gameState"
              }
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "game",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "gameState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "ended"
          }
        ]
      }
    },
    {
      "name": "gameUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "type": "pubkey"
          },
          {
            "name": "gameState",
            "type": {
              "defined": {
                "name": "gameState"
              }
            }
          },
          {
            "name": "currentPlayer",
            "type": "pubkey"
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
