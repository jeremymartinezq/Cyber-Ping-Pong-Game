// Game Constants
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const BALL_RADIUS = 8;
const BALL_SPEED_MIN = 5;
const BALL_SPEED_MAX = 15;
const BALL_SPEED_INCREMENT = 0.2;
const PADDLE_SPEED = 8;
const WINNING_SCORE = 10;

// AI difficulty settings
const AI_SETTINGS = {
  EASY: {
    REACTION_TIME: 0.15, // Lower = faster reactions (0-1)
    DIFFICULTY: 0.6,     // Higher = more accurate (0-1)
    PERFECT_CENTER: false // Whether AI returns to center perfectly
  },
  NORMAL: {
    REACTION_TIME: 0.08,
    DIFFICULTY: 0.8,
    PERFECT_CENTER: false
  },
  HARD: {
    REACTION_TIME: 0.04,
    DIFFICULTY: 0.95,
    PERFECT_CENTER: true
  }
};

// Game State
let gameActive = false;
let gameMode = null; // 'single' or 'two'
let difficulty = 'NORMAL'; // 'EASY', 'NORMAL', or 'HARD'
let player1Score = 0;
let player2Score = 0;
let canvas, ctx;
let canvasWidth, canvasHeight;
let lastTime = 0;
let frameCount = 0;

// Game Objects
let ball = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  speed: BALL_SPEED_MIN,
  angle: 0,
  lastHit: null
};

let paddle1 = {
  x: 0,
  y: 0,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0,
  speed: PADDLE_SPEED,
  color: '#0ff'
};

let paddle2 = {
  x: 0,
  y: 0,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  dy: 0,
  speed: PADDLE_SPEED,
  color: '#f0f'
};

// AI variables
let aiTargetY = 0;
let aiSmoothing = 0;
let aiLastMoveTime = 0;
const AI_MOVEMENT_THRESHOLD = 2; // Minimum distance to move in pixels

// Controls
const keys = {};

// Keyboard mappings for controls
const CONTROL_MAPPINGS = {
  PLAYER1_UP: ['w', 'W'],
  PLAYER1_DOWN: ['s', 'S'],
  PLAYER2_UP: ['ArrowUp', 'Up'],
  PLAYER2_DOWN: ['ArrowDown', 'Down']
};

// Effect Systems
let particleSystem;
let screenShake;
let scanner;
let grid;

// Initialize the game
function init() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  
  // Set canvas dimensions
  resizeCanvas();
  
  // Initialize effect systems
  particleSystem = new ParticleSystem(canvas, ctx);
  screenShake = new ScreenShake(canvas);
  scanner = new Scanner(canvas, ctx);
  grid = new Grid(canvas, ctx);
  
  // Setup event listeners
  setupEventListeners();
  
  // Show start screen
  document.getElementById('start-screen').classList.remove('hidden');
  document.getElementById('game-ui').classList.add('hidden');
  document.getElementById('game-over').classList.add('hidden');
  document.getElementById('difficulty-select').classList.add('hidden');
  
  // Start animation loop
  requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
  const container = document.getElementById('game-container');
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  
  // Recalculate positions
  resetPositions();
}

function resetPositions() {
  // Position paddles
  paddle1.x = 20;
  paddle1.y = canvasHeight / 2 - PADDLE_HEIGHT / 2;
  
  paddle2.x = canvasWidth - 20 - PADDLE_WIDTH;
  paddle2.y = canvasHeight / 2 - PADDLE_HEIGHT / 2;
  
  // Position ball in center
  resetBall();
}

function resetBall() {
  ball.x = canvasWidth / 2;
  ball.y = canvasHeight / 2;
  ball.speed = BALL_SPEED_MIN;
  
  // Random angle between -π/4 and π/4 or 3π/4 and 5π/4
  const direction = Math.random() > 0.5 ? 1 : -1;
  ball.angle = direction * (Math.PI / 4 * Math.random() + Math.PI / 8);
  
  // Calculate velocity from angle and speed
  updateBallVelocity();
  
  // Reset AI
  aiTargetY = canvasHeight / 2;
  aiSmoothing = 0;
  aiLastMoveTime = 0;
  
  // Last hit
  ball.lastHit = null;
}

function updateBallVelocity() {
  ball.dx = Math.cos(ball.angle) * ball.speed;
  ball.dy = Math.sin(ball.angle) * ball.speed;
}

function showDifficultySelect() {
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('difficulty-select').classList.remove('hidden');
}

function startGame(mode, difficultyLevel = 'NORMAL') {
  gameMode = mode;
  difficulty = difficultyLevel;
  gameActive = true;
  player1Score = 0;
  player2Score = 0;
  
  updateScoreDisplay();
  
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('difficulty-select').classList.add('hidden');
  document.getElementById('game-ui').classList.remove('hidden');
  document.getElementById('game-over').classList.add('hidden');
  
  resetPositions();
}

function endGame() {
  gameActive = false;
  
  const winner = player1Score > player2Score ? 'PLAYER 1' : 'PLAYER 2';
  document.getElementById('winner-text').textContent = `${winner} WINS!`;
  
  document.getElementById('game-over').classList.remove('hidden');
}

function updateScoreDisplay() {
  document.getElementById('player1-score').textContent = player1Score;
  document.getElementById('player2-score').textContent = player2Score;
}

function setupEventListeners() {
  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    console.log('Key down:', e.key);
    // Set the key state to true
    keys[e.key] = true;
    
    // Only prevent default for game controls
    const allControlKeys = [
      ...CONTROL_MAPPINGS.PLAYER1_UP,
      ...CONTROL_MAPPINGS.PLAYER1_DOWN,
      ...CONTROL_MAPPINGS.PLAYER2_UP,
      ...CONTROL_MAPPINGS.PLAYER2_DOWN
    ];
    
    if (allControlKeys.includes(e.key)) {
      e.preventDefault();
    }
  });
  
  window.addEventListener('keyup', (e) => {
    console.log('Key up:', e.key);
    // Set the key state to false
    keys[e.key] = false;
    
    // Only prevent default for game controls
    const allControlKeys = [
      ...CONTROL_MAPPINGS.PLAYER1_UP,
      ...CONTROL_MAPPINGS.PLAYER1_DOWN,
      ...CONTROL_MAPPINGS.PLAYER2_UP,
      ...CONTROL_MAPPINGS.PLAYER2_DOWN
    ];
    
    if (allControlKeys.includes(e.key)) {
      e.preventDefault();
    }
  });
  
  // Touch controls for mobile
  canvas.addEventListener('touchstart', handleTouch);
  canvas.addEventListener('touchmove', handleTouch);
  
  // Button controls
  document.getElementById('single-player-btn').addEventListener('click', showDifficultySelect);
  document.getElementById('two-player-btn').addEventListener('click', () => startGame('two'));
  document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
  });
  
  // Difficulty buttons
  document.getElementById('easy-btn').addEventListener('click', () => startGame('single', 'EASY'));
  document.getElementById('normal-btn').addEventListener('click', () => startGame('single', 'NORMAL'));
  document.getElementById('hard-btn').addEventListener('click', () => startGame('single', 'HARD'));
  document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('difficulty-select').classList.add('hidden');
  });
  
  // Window resize
  window.addEventListener('resize', resizeCanvas);
}

// Helper function to check if any key in a mapping is pressed
function isKeyPressed(mapping) {
  return CONTROL_MAPPINGS[mapping].some(key => keys[key]);
}

function handleTouch(e) {
  e.preventDefault();
  
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const touchY = touch.clientY - rect.top;
  
  // Clear previous touch keys for both players
  CONTROL_MAPPINGS.PLAYER1_UP.forEach(key => keys[key] = false);
  CONTROL_MAPPINGS.PLAYER1_DOWN.forEach(key => keys[key] = false);
  CONTROL_MAPPINGS.PLAYER2_UP.forEach(key => keys[key] = false);
  CONTROL_MAPPINGS.PLAYER2_DOWN.forEach(key => keys[key] = false);
  
  // Determine which half of the screen was touched
  if (gameMode === 'single') {
    // In single player mode, player controls paddle1 with either side of the screen
    if (touchY < paddle1.y + paddle1.height / 2) {
      keys[CONTROL_MAPPINGS.PLAYER2_UP[0]] = true; // Use arrow keys mapping
    } else {
      keys[CONTROL_MAPPINGS.PLAYER2_DOWN[0]] = true; // Use arrow keys mapping
    }
  } else if (gameMode === 'two') {
    // In two player mode, left/right sides control different paddles
    if (touch.clientX < window.innerWidth / 2) {
      // Left side - control paddle1 with W/S
      if (touchY < paddle1.y + paddle1.height / 2) {
        keys[CONTROL_MAPPINGS.PLAYER1_UP[0]] = true;
      } else {
        keys[CONTROL_MAPPINGS.PLAYER1_DOWN[0]] = true;
      }
    } else {
      // Right side - control paddle2 with arrow keys  
      if (touchY < paddle2.y + paddle2.height / 2) {
        keys[CONTROL_MAPPINGS.PLAYER2_UP[0]] = true;
      } else {
        keys[CONTROL_MAPPINGS.PLAYER2_DOWN[0]] = true;
      }
    }
  }
}

function gameLoop(timestamp) {
  // Calculate delta time
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw background grid
  grid.render();
  
  // Draw scanner effect
  scanner.update();
  scanner.render();
  
  // Update and draw game objects
  updateGame(deltaTime);
  drawGame();
  
  // Update particles
  particleSystem.update();
  particleSystem.render();
  
  // Update screen shake
  screenShake.update();
  
  // Performance counter
  frameCount++;
  
  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
  if (!gameActive) return;
  
  // Update paddle positions based on game mode
  if (gameMode === 'single') {
    // Single player mode - Use arrow keys for the player paddle
    console.log("Single player - Keys state:", keys);
    if (isKeyPressed('PLAYER2_UP')) {
      paddle1.dy = -paddle1.speed;
    } else if (isKeyPressed('PLAYER2_DOWN')) {
      paddle1.dy = paddle1.speed;
    } else {
      paddle1.dy = 0;
    }
    
    paddle1.y += paddle1.dy;
    
    // AI controls paddle2
    updateAI();
  } else if (gameMode === 'two') {
    // Two player mode
    // Player 1 uses W/S
    if (isKeyPressed('PLAYER1_UP')) {
      paddle1.dy = -paddle1.speed;
    } else if (isKeyPressed('PLAYER1_DOWN')) {
      paddle1.dy = paddle1.speed;
    } else {
      paddle1.dy = 0;
    }
    
    paddle1.y += paddle1.dy;
    
    // Player 2 uses arrow keys
    console.log("Two player - Keys state:", keys);
    if (isKeyPressed('PLAYER2_UP')) {
      paddle2.dy = -paddle2.speed;
    } else if (isKeyPressed('PLAYER2_DOWN')) {
      paddle2.dy = paddle2.speed;
    } else {
      paddle2.dy = 0;
    }
    
    paddle2.y += paddle2.dy;
  }
  
  // Keep paddles within bounds
  paddle1.y = Math.max(0, Math.min(canvasHeight - paddle1.height, paddle1.y));
  paddle2.y = Math.max(0, Math.min(canvasHeight - paddle2.height, paddle2.y));
  
  // Update ball position
  ball.x += ball.dx;
  ball.y += ball.dy;
  
  // Create ball trail
  if (frameCount % 3 === 0) {
    const trailColor = ball.lastHit === 'player1' ? paddle1.color : 
                      ball.lastHit === 'player2' ? paddle2.color : '#fff';
    particleSystem.createTrail(ball.x, ball.y, Math.atan2(ball.dy, ball.dx) + Math.PI, ball.speed, trailColor);
  }
  
  // Ball collision with top and bottom
  if (ball.y < BALL_RADIUS || ball.y > canvasHeight - BALL_RADIUS) {
    ball.dy = -ball.dy;
    
    // Adjust y position to prevent sticking to the edge
    if (ball.y < BALL_RADIUS) ball.y = BALL_RADIUS;
    if (ball.y > canvasHeight - BALL_RADIUS) ball.y = canvasHeight - BALL_RADIUS;
    
    // Create small effect
    particleSystem.createExplosion(ball.x, ball.y, 10, '#fff');
  }
  
  // Ball collision with paddles
  if (checkPaddleCollision(paddle1, 'player1') || checkPaddleCollision(paddle2, 'player2')) {
    // Increase ball speed
    ball.speed = Math.min(BALL_SPEED_MAX, ball.speed + BALL_SPEED_INCREMENT);
    updateBallVelocity();
  }
  
  // Ball goes out of bounds - scoring
  if (ball.x < 0) {
    // Player 2 scores
    player2Score++;
    updateScoreDisplay();
    particleSystem.createExplosion(ball.x, ball.y, 50, paddle2.color);
    screenShake.shake(8, 400);
    
    if (player2Score >= WINNING_SCORE) {
      endGame();
    } else {
      resetBall();
    }
  } else if (ball.x > canvasWidth) {
    // Player 1 scores
    player1Score++;
    updateScoreDisplay();
    particleSystem.createExplosion(ball.x, ball.y, 50, paddle1.color);
    screenShake.shake(8, 400);
    
    if (player1Score >= WINNING_SCORE) {
      endGame();
    } else {
      resetBall();
    }
  }
}

function checkPaddleCollision(paddle, player) {
  // Check for collision with paddle
  if (ball.x - BALL_RADIUS < paddle.x + paddle.width &&
      ball.x + BALL_RADIUS > paddle.x &&
      ball.y + BALL_RADIUS > paddle.y &&
      ball.y - BALL_RADIUS < paddle.y + paddle.height) {
    
    // Calculate collision point ratio along the paddle height (0-1)
    const collisionPoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    
    // Calculate new angle based on collision point
    const maxAngle = Math.PI / 3;
    ball.angle = collisionPoint * maxAngle;
    
    // Adjust angle based on which paddle was hit
    if (player === 'player1') {
      ball.angle = 0 - ball.angle;
    } else {
      ball.angle = Math.PI - ball.angle;
    }
    
    // Update velocity with new angle
    updateBallVelocity();
    
    // Move the ball outside the paddle to prevent multiple collisions
    if (player === 'player1') {
      ball.x = paddle.x + paddle.width + BALL_RADIUS;
    } else {
      ball.x = paddle.x - BALL_RADIUS;
    }
    
    // Record which paddle was hit
    ball.lastHit = player;
    
    // Create explosion effect
    const color = player === 'player1' ? paddle1.color : paddle2.color;
    particleSystem.createExplosion(ball.x, ball.y, 25, color);
    screenShake.shake(3, 200);
    
    return true;
  }
  
  return false;
}

function updateAI() {
  // Get difficulty settings
  const settings = AI_SETTINGS[difficulty];
  
  // Calculate where the ball will be at the paddle's x position
  if (ball.dx > 0) {
    // Ball is moving toward the AI paddle
    
    // Calculate time to reach paddle
    const timeToReach = (paddle2.x - ball.x) / ball.dx;
    
    // Calculate y-position at that time
    const predictedY = ball.y + ball.dy * timeToReach;
    
    // Apply some randomness to the prediction based on difficulty
    const errorMargin = (1 - settings.DIFFICULTY) * paddle2.height;
    const randomizedY = predictedY + (Math.random() * errorMargin - errorMargin / 2);
    
    // Smoothly update the AI target
    aiTargetY = aiSmoothing * aiTargetY + (1 - aiSmoothing) * randomizedY;
    aiSmoothing = Math.min(aiSmoothing + settings.REACTION_TIME, 0.9);
  } else {
    // Ball is moving away from the AI paddle
    if (settings.PERFECT_CENTER) {
      // Hard mode - return to center perfectly
      aiTargetY = canvasHeight / 2;
    } else {
      // Easy/Normal - return to center with some randomness
      aiTargetY = canvasHeight / 2 + (Math.random() * 100 - 50);
    }
    aiSmoothing = 0.95;
  }
  
  // Move the paddle toward the target y position
  const paddleCenter = paddle2.y + paddle2.height / 2;
  const distance = aiTargetY - paddleCenter;
  
  // Only move if the distance is significant to prevent jitter
  if (Math.abs(distance) > AI_MOVEMENT_THRESHOLD) {
    paddle2.dy = Math.sign(distance) * Math.min(Math.abs(distance) * 0.1, paddle2.speed);
    aiLastMoveTime = Date.now();
  } else {
    // If we haven't moved in a while, stop the paddle completely
    if (Date.now() - aiLastMoveTime > 200) {
      paddle2.dy = 0;
    } else {
      // Gradually decrease movement to prevent abrupt stops
      paddle2.dy *= 0.8;
    }
  }
  
  paddle2.y += paddle2.dy;
}

function drawGame() {
  // Draw middle line
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2, 0);
  ctx.lineTo(canvasWidth / 2, canvasHeight);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Draw ball with glow
  ctx.fillStyle = ball.lastHit === 'player1' ? paddle1.color : 
                 ball.lastHit === 'player2' ? paddle2.color : '#fff';
  ctx.shadowBlur = 20;
  ctx.shadowColor = ctx.fillStyle;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  
  // Reset shadow for performance
  ctx.shadowBlur = 0;
  
  // Draw paddles
  drawPaddle(paddle1);
  drawPaddle(paddle2);
}

function drawPaddle(paddle) {
  // Paddle glow
  ctx.shadowBlur = 15;
  ctx.shadowColor = paddle.color;
  
  // Main paddle
  ctx.fillStyle = paddle.color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  
  // Inner highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(paddle.x + 2, paddle.y + 2, paddle.width - 4, 2);
  
  // Reset shadow for performance
  ctx.shadowBlur = 0;
}

// Start the game when the page loads
window.addEventListener('load', init); 