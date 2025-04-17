"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface GameBoardProps {
  board: Array<string | null>
  onCellClick: (index: number) => void
  currentPlayer: "X" | "O" | undefined
  isPlayerTurn: boolean | undefined
  isGameActive: boolean
  winningCombination: number[] | null
}

export default function GameBoard({
  board,
  onCellClick,
  currentPlayer,
  isPlayerTurn,
  isGameActive,
  winningCombination,
}: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)

  const handleCellClick = (index: number) => {
    if (!isGameActive || !isPlayerTurn || board[index]) return
    onCellClick(index)
  }

  const isWinningCell = (index: number) => {
    return winningCombination?.includes(index) || false
  }

  return (
    <div
      className="grid grid-cols-3 gap-2 w-full max-w-xs mx-auto"
      role="grid"
      aria-label="Tic Tac Toe game board"
    >
      {board.map((cell, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center justify-center bg-white rounded-md border-2 text-4xl font-bold cursor-pointer transition-all duration-200 w-20 h-20 sm:w-24 sm:h-24",
            isWinningCell(index) ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-[#77B254]",
            !cell && isPlayerTurn && isGameActive ? "hover:bg-green-50" : "",
            !isGameActive || cell !== null || !isPlayerTurn ? "cursor-default" : "",
          )}
          onClick={() => handleCellClick(index)}
          onMouseEnter={() => setHoveredCell(index)}
          onMouseLeave={() => setHoveredCell(null)}
          role="gridcell"
          aria-label={`Cell ${index + 1}, ${cell || "empty"}`}
          tabIndex={!cell && isPlayerTurn && isGameActive ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCellClick(index)
            }
          }}
        >
          {cell ||
            (hoveredCell === index && isPlayerTurn && isGameActive && !cell ? (
              <span className="opacity-30">{currentPlayer}</span>
            ) : (
              ""
            ))}
        </div>
      ))}
    </div>
  )
}
