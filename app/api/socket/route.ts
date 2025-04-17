import type { NextRequest } from "next/server"

// Game state storage
const games = new Map()
const connections = new Map()
const playerSessions = new Map() // Track player sessions

// Check for winner
function checkWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]
    }
  }

  return null
}

// Handle player move
function handleMove(gameId, playerId, index) {
  if (!games.has(gameId)) return null

  const game = games.get(gameId)

  // Check if it's the player's turn
  if (game.currentTurn !== playerId) return game

  // Check if the cell is empty
  if (game.board[index] !== null) return game

  // Check if the game is still active
  if (game.status !== "playing") return game

  // Make the move
  const nextBoard = [...game.board]
  const playerSymbol = game.players.find((p) => p.id === playerId)?.symbol
  nextBoard[index] = playerSymbol

  // Check for winner
  const winner = checkWinner(nextBoard)
  let nextStatus = game.status
  let nextWinner = game.winner
  let nextIsDraw = game.isDraw
  let nextTurn = game.currentTurn

  if (winner) {
    nextWinner = playerId
    nextStatus = "finished"
  } else if (nextBoard.every((cell) => cell !== null)) {
    // Check for draw
    nextIsDraw = true
    nextStatus = "finished"
  } else {
    // Switch turns
    nextTurn = game.players.find((p) => p.id !== playerId)?.id
  }

  // Update game state
  const updatedGame = {
    ...game,
    board: nextBoard,
    currentTurn: nextTurn,
    winner: nextWinner,
    isDraw: nextIsDraw,
    status: nextStatus,
  }

  games.set(gameId, updatedGame)
  return updatedGame
}

// Reset game
function resetGame(gameId, playerId) {
  if (!games.has(gameId)) return null

  const game = games.get(gameId)

  // Only allow reset if game is finished
  if (game.status !== "finished") return game

  // Alternate who goes first
  const lastStarter = game.players.findIndex((p) => p.id === game.currentTurn)
  const nextTurn = game.players[(lastStarter + 1) % 2]?.id

  // Reset game state
  const updatedGame = {
    ...game,
    board: Array(9).fill(null),
    winner: null,
    isDraw: false,
    status: "playing",
    currentTurn: nextTurn,
  }

  games.set(gameId, updatedGame)
  return updatedGame
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const gameId = url.searchParams.get("gameId")

  if (!gameId) {
    return new Response(JSON.stringify({ error: "Game ID is required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }

  // Return current game state
  const game = games.get(gameId) || {
    board: Array(9).fill(null),
    currentTurn: null,
    winner: null,
    isDraw: false,
    players: [],
    status: "waiting",
  }

  return new Response(JSON.stringify({ gameState: game }), {
    headers: {
      "Content-Type": "application/json",
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, gameId, playerId, playerName, index } = body

    if (!gameId) {
      return new Response(JSON.stringify({ error: "Game ID is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    // Handle different action types
    if (type === "join_game") {
      // Check if player already exists in the game
      const existingGame = games.get(gameId)
      if (existingGame) {
        const existingPlayer = existingGame.players.find(p => p.name === playerName)
        if (existingPlayer) {
          return new Response(
            JSON.stringify({
              playerId: existingPlayer.id,
              gameState: existingGame,
            }),
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          )
        }
      }

      // Initialize or join game
      if (!games.has(gameId)) {
        // Create new game with first player
        const newPlayerId = playerName + "-" + Date.now()
        const newGame = {
          board: Array(9).fill(null),
          currentTurn: newPlayerId,
          winner: null,
          isDraw: false,
          players: [
            {
              id: newPlayerId,
              name: playerName,
              symbol: "X",
            },
          ],
          status: "waiting",
        }
        games.set(gameId, newGame)
        playerSessions.set(newPlayerId, { gameId, lastSeen: Date.now() })

        return new Response(
          JSON.stringify({
            playerId: newPlayerId,
            gameState: newGame,
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      } else {
        // Join existing game
        const game = games.get(gameId)

        // Check if game is full
        if (game.players.length >= 2) {
          return new Response(
            JSON.stringify({
              error: "Game is full",
              gameState: game,
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
              },
            },
          )
        }

        // Add second player
        const newPlayerId = playerName + "-" + Date.now()
        game.players.push({
          id: newPlayerId,
          name: playerName,
          symbol: "O",
        })

        // Start game
        game.status = "playing"
        games.set(gameId, game)
        playerSessions.set(newPlayerId, { gameId, lastSeen: Date.now() })

        return new Response(
          JSON.stringify({
            playerId: newPlayerId,
            gameState: game,
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
      }
    } else if (type === "make_move") {
      // Verify player is in the game
      const game = games.get(gameId)
      if (!game) {
        return new Response(JSON.stringify({ error: "Game not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        })
      }

      const player = game.players.find(p => p.id === playerId)
      if (!player) {
        return new Response(JSON.stringify({ error: "Player not found in game" }), {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        })
      }

      const updatedGame = handleMove(gameId, playerId, index)
      if (updatedGame) {
        playerSessions.set(playerId, { gameId, lastSeen: Date.now() })
      }

      return new Response(JSON.stringify({ gameState: updatedGame }), {
        headers: {
          "Content-Type": "application/json",
        },
      })
    } else if (type === "reset_game") {
      const updatedGame = resetGame(gameId, playerId)

      if (!updatedGame) {
        return new Response(JSON.stringify({ error: "Game not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        })
      }

      return new Response(JSON.stringify({ gameState: updatedGame }), {
        headers: {
          "Content-Type": "application/json",
        },
      })
    } else if (type === "poll_game") {
      // Return current game state for polling
      const game = games.get(gameId)

      if (!game) {
        return new Response(JSON.stringify({ error: "Game not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        })
      }

      return new Response(JSON.stringify({ gameState: game }), {
        headers: {
          "Content-Type": "application/json",
        },
      })
    }

    return new Response(JSON.stringify({ error: "Invalid action type" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}
