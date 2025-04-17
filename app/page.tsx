"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  const [gameId, setGameId] = useState("")
  const [playerName, setPlayerName] = useState("")
  const router = useRouter()

  const createGame = () => {
    if (!playerName.trim()) return

    // Generate a random game ID
    const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/game/${newGameId}?name=${encodeURIComponent(playerName)}`)
  }

  const joinGame = () => {
    if (!gameId.trim() || !playerName.trim()) return
    router.push(`/game/${gameId}?name=${encodeURIComponent(playerName)}`)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFAF6] p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col items-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-2 sm:mb-3 md:mb-4 overflow-hidden">
          <img src="/unnamed.png" alt="Ticky Tacky Logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#77B254]">Ticky Tacky</h1>
      </div>
      <Card className="w-full max-w-[90%] sm:max-w-md">
        <CardHeader className="text-center space-y-2 sm:space-y-3">
          <CardDescription className="text-sm sm:text-base">Play with friends in real-time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-sm sm:text-base">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="focus-visible:ring-[#77B254] focus-visible:ring-offset-0 h-9 sm:h-10"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="gameId" className="text-sm sm:text-base">Game Code (to join existing game)</Label>
            <Input
              id="gameId"
              placeholder="Enter game code"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              className="focus-visible:ring-[#77B254] focus-visible:ring-offset-0 h-9 sm:h-10"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 sm:space-y-3">
          <Button className="w-full bg-[#77B254] hover:bg-[#77B254]/90 h-9 sm:h-10" onClick={createGame} disabled={!playerName.trim()}>
            Create New Game
          </Button>
          <Button
            className="w-full h-9 sm:h-10"
            variant="outline"
            onClick={joinGame}
            disabled={!gameId.trim() || !playerName.trim()}
          >
            Join Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
