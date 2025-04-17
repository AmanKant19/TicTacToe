# TicTacToe
# Ticky Tacky - Real-Time Multiplayer Tic-tac-toe

![Ticky Tacky Logo](/unnamed.png)

A modern, real-time multiplayer Tic-tac-toe game built with Next.js 15, React 19, and styled with Tailwind CSS. Play with friends in real-time by creating or joining game rooms!

## Features

- 🎮 Real-time multiplayer gameplay
- 🎨 Modern, responsive UI with Tailwind CSS
- 🎯 Easy game room creation and joining
- 🔒 Unique game codes for private matches
- 📱 Mobile-friendly design
- 🎭 Custom player names

## Tech Stack

- **Frontend Framework**: Next.js 15
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Type Safety**: TypeScript
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Theme**: Next-themes for dark/light mode support

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm (Package manager)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ticky-tacky.git
cd ticky-tacky
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

## How to Play

1. **Create a Game**
   - Enter your name
   - Click "Create New Game"
   - Share the generated game code with your friend

2. **Join a Game**
   - Enter your name
   - Input the game code shared by your friend
   - Click "Join Game"

3. **Gameplay**
   - Players take turns placing their marks (X or O) on the board
   - First player to get three in a row (horizontally, vertically, or diagonally) wins!
   - If no player achieves three in a row and the board is full, the game ends in a draw

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
