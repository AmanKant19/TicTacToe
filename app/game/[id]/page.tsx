"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Copy, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMobile } from "@/hooks/use-mobile"
import GameBoard from "@/components/game-board"
import { useToast } from "@/hooks/use-toast"

type Player = {
  id: string
  name: string
  symbol: "X" | "O"
}

type GameState = {
  board: Array<string | null>
  currentTurn: string | null
  winner: string | null
  isDraw: boolean
  players: Player[]
  status: "waiting" | "playing" | "finished"
}

export default function GamePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const gameId = params.id as string
  const playerName = searchParams.get("name") || "Guest"
  const isMobile = useMobile()
  const { toast } = useToast()

  const [playerId, setPlayerId] = useState<string>(() => {
    // Try to get playerId from localStorage
    if (typeof window !== 'undefined') {
      const savedPlayerId = localStorage.getItem(`playerId-${gameId}`)
      if (savedPlayerId) {
        return savedPlayerId
      }
    }
    return ""
  })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentTurn: null,
    winner: null,
    isDraw: false,
    players: [],
    status: "waiting",
  })

  // Save playerId to localStorage when it changes
  useEffect(() => {
    if (playerId && typeof window !== 'undefined') {
      localStorage.setItem(`playerId-${gameId}`, playerId)
    }
  }, [playerId, gameId])

  // Join the game initially
  useEffect(() => {
    const joinGame = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/socket?gameId=${gameId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "join_game",
            gameId,
            playerName,
            playerId: playerId || undefined, // Only send playerId if it exists
          }),
        })

        const data = await response.json()

        if (response.ok) {
          if (data.playerId) {
            setPlayerId(data.playerId)
          }
          if (data.gameState) {
            setGameState(data.gameState)
          }
          setError(null)
        } else {
          setError(data.error || "Failed to join game")
          toast({
            title: "Error",
            description: data.error || "Failed to join game",
            variant: "destructive",
          })
        }
      } catch (err) {
        setError("Failed to connect to the game server")
        toast({
          title: "Connection Error",
          description: "Failed to connect to the game server",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    joinGame()
  }, [gameId, playerName, playerId, toast])

  // Poll for game updates
  useEffect(() => {
    if (!playerId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/socket?gameId=${gameId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "poll_game",
            gameId,
            playerId,
          }),
        })

        const data = await response.json()

        if (response.ok && data.gameState) {
          setGameState(data.gameState)
          setError(null)
        }
      } catch (err) {
        console.error("Polling error:", err)
        // Don't set error on polling failures to avoid disrupting the game
      }
    }, 1000) // Poll every second

    return () => clearInterval(pollInterval)
  }, [gameId, playerId])

  const makeMove = useCallback(
    async (index: number) => {
      if (!playerId) return

      try {
        const response = await fetch(`/api/socket?gameId=${gameId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "make_move",
            gameId,
            playerId,
            index,
          }),
        })

        const data = await response.json()

        if (response.ok && data.gameState) {
          setGameState(data.gameState)
        } else if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          })
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to make move",
          variant: "destructive",
        })
      }
    },
    [gameId, playerId, toast],
  )

  const resetGame = useCallback(async () => {
    if (!playerId) return

    try {
      const response = await fetch(`/api/socket?gameId=${gameId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "reset_game",
          gameId,
          playerId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.gameState) {
        setGameState(data.gameState)
      } else if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reset game",
        variant: "destructive",
      })
    }
  }, [gameId, playerId, toast])

  const copyGameId = () => {
    navigator.clipboard.writeText(gameId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Game code copied!",
      description: "Share this code with your friend to play together.",
    })
  }

  const currentPlayer = gameState.players.find((player) => player.id === playerId)
  const isPlayerTurn = currentPlayer && gameState.currentTurn === playerId
  const isGameActive = gameState.status === "playing"
  const isWaiting = gameState.status === "waiting"
  const isGameOver = gameState.status === "finished"

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFAF6] p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-[90%] sm:max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Loading Ticky Tacky...</h2>
              <p className="text-sm text-gray-500">Please wait while we connect you to the game.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFAF6] p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-[90%] sm:max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center mb-3 sm:mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden mb-2 sm:mb-3">
              <img src="/unnamed.png" alt="Ticky Tacky Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#77B254]">Ticky Tacky</h1>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center justify-center sm:justify-end gap-2">
              <span className="text-xs sm:text-sm font-medium">Game Code: {gameId}</span>
              <Button variant="ghost" size="icon" onClick={copyGameId} className="h-7 w-7 sm:h-8 sm:w-8">
                {copied ? <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" /> : <Copy className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
            </div>
          </div>
          <CardDescription>
            {isWaiting
              ? "Waiting for another player to join..."
              : isGameOver
                ? gameState.winner
                  ? `Game Over! ${gameState.players.find((p) => p.id === gameState.winner)?.name} wins!`
                  : "Game Over! It's a draw!"
                : `${gameState.players.find((p) => p.id === gameState.currentTurn)?.name}'s turn (${gameState.players.find((p) => p.id === gameState.currentTurn)?.symbol})`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="mb-4 flex justify-between">
                {gameState.players.map((player, index) => (
                  <div key={player.id} className="text-center">
                    <Badge variant={player.id === playerId ? "default" : "outline"}>
                      {player.name} ({player.symbol})
                    </Badge>
                    {player.id === gameState.currentTurn && isGameActive && (
                      <div className="mt-1 h-1 w-full rounded-full bg-[#77B254]"></div>
                    )}
                  </div>
                ))}
              </div>

              <GameBoard
                board={gameState.board}
                onCellClick={makeMove}
                currentPlayer={currentPlayer?.symbol}
                isPlayerTurn={isPlayerTurn}
                isGameActive={isGameActive}
                winningCombination={gameState.winner ? getWinningCombination(gameState.board) : null}
              />
            </>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          {isGameOver && <Button onClick={resetGame}>Play Again</Button>}
        </CardFooter>
      </Card>
    </div>
  )
}

// Helper function to determine the winning combination
function getWinningCombination(board: Array<string | null>): number[] | null {
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
      return [a, b, c]
    }
  }

  return null
}
