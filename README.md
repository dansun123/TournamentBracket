# Tournament Bracket Generator

A beautiful and interactive tournament bracket application built with React and the `@g-loot/react-tournament-brackets` library.

## Features

- Enter seeded participant names (one per line)
- Automatically generates single-elimination tournament brackets
- Beautiful, modern UI with gradient backgrounds and smooth animations
- Responsive design that works on all screen sizes
- SVG-based bracket rendering with pan and zoom capabilities
- Supports any number of participants (automatically adds BYE placeholders)

## Installation

1. Install dependencies:
```bash
npm install
```

Note: This project uses `--legacy-peer-deps` due to React version compatibility with the bracket library.

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## How to Use

1. On the initial screen, enter participant names in the text area, one per line
2. Names are automatically seeded in the order you enter them (first name = seed 1, etc.)
3. Click "Generate Bracket" to create the tournament bracket
4. The bracket will display with all matchups organized by rounds
5. Click "Start New Tournament" to reset and create a new bracket

## Example Participants

```
Player 1
Player 2
Player 3
Player 4
Player 5
Player 6
Player 7
Player 8
```

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **@g-loot/react-tournament-brackets** - Beautiful bracket visualization
- **styled-components** - Styling (required by bracket library)
- **react-svg-pan-zoom** - Interactive SVG viewing

## Project Structure

```
src/
├── App.jsx         # Main application component
├── App.css         # Application styles
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## License

MIT
