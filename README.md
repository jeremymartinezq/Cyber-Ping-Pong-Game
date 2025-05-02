# Cybernetic Ping Pong

A futuristic, interactive, and visually exciting Cyberpunk-themed Ping Pong game built with HTML5 Canvas, TailwindCSS, and JavaScript.

## Features

### 🎮 Gameplay
- Classic ping pong mechanics with neon cyberpunk aesthetics
- Single-player mode vs AI and two-player local mode
- Fast-paced gameplay with gradually increasing ball speed
- Score tracking with win condition (first to 10 points)
- Multiple difficulty levels for single-player mode

### 💥 Visual Effects
- Glowing neon paddles and ball trail
- Dark, digital circuit-board-like background
- Particle explosion effects when the ball hits paddles or scores
- Screen shake and visual feedback
- Scanning line effect for futuristic ambiance

### 🧠 AI Opponent
- Three difficulty levels: Easy, Normal, and Hard
- Challenging but beatable AI that adapts to your skill level
- AI prediction with configurable difficulty and reaction time
- Dynamic paddle movement with realistic error margins

### 🕹️ Controls
- **Single Player Mode:** Arrow Up/Down keys
- **Two Player Mode:** 
  - Player 1: W/S keys
  - Player 2: Arrow Up/Down keys
- Touch controls for mobile devices
- Responsive design that works on different screen sizes

## How to Play

### Method 1: Direct File Opening
Simply open `index.html` in a modern web browser.

### Method 2: Using Node.js Server (Recommended)
1. Make sure you have Node.js installed
2. Open a terminal/command prompt in the project directory
3. Run `npm start` or `node server.js`
4. Open a browser and navigate to `http://localhost:3000`

### Gameplay Instructions
1. Select game mode (Single Player or Two Player)
2. If Single Player, choose a difficulty level:
   - **Easy**: Slower AI reactions, less accurate predictions
   - **Normal**: Balanced AI reactions and predictions
   - **Hard**: Fast reactions and highly accurate predictions
3. In Single Player mode: Use Arrow Up/Down keys
4. In Two Player mode: Player 1 uses W/S keys, Player 2 uses Arrow Up/Down keys
5. First player to reach 10 points wins!

## Technical Details

The game is built with vanilla JavaScript and HTML5 Canvas, using:
- TailwindCSS for UI styling
- Canvas for rendering the game
- Particle systems for visual effects
- Responsive design for different screen sizes

## Credits

Created by [Your Name] as a cyberpunk-themed game project.

## License

MIT License 