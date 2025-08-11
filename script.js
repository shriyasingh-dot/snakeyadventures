/*
 * * * --- Game Constants & Variables ---
 * * */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const grid = 20; // Size of each grid cell
let snake = [{ x: 200, y: 200 }]; // Initial snake position
let food = {};
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let direction = { x: grid, y: 0 }; // Initial direction: right
let gameLoop;
let isPaused = false;
let isGameOver = false;
let gameSpeed = 150; // Milliseconds per frame
let lastDirection = { x: grid, y: 0 }; // To prevent reverse movement
let isMobile = /Mobi|Android/i.test(navigator.userAgent);
let initialGameLoad = true;

/*
 * * * --- DOM Elements ---
 * * */
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const finalScoreDisplay = document.getElementById('finalScore');
const modalHighScoreDisplay = document.getElementById('modalHighScore');
const snakeLengthDisplay = document.getElementById('snakeLength');
const levelDisplay = document.getElementById('level');

const instructionsOverlay = document.getElementById('instructionsOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const canvasOverlay = document.getElementById('canvasOverlay');

const startGameBtn = document.getElementById('startGameBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const resumeBtn = document.getElementById('resumeBtn');
const infoBtn = document.getElementById('infoBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const startBtn = document.getElementById('startBtn');

const gameSpeedSelect = document.getElementById('gameSpeed');
const soundToggle = document.getElementById('soundToggle');
const gridToggle = document.getElementById('gridToggle');
const mobileControls = document.getElementById('mobileControls');

const eatSound = document.getElementById('eatSound');
const gameOverSound = document.getElementById('gameOverSound');

// Initial display setup
highScoreDisplay.textContent = highScore;
document.getElementById('footerHighScore').textContent = highScore;

/*
 * * * --- Game Functions ---
 * * */
function generateFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / grid)) * grid,
    y: Math.floor(Math.random() * (canvas.height / grid)) * grid,
  };
  // Ensure food doesn't spawn on the snake
  for (let segment of snake) {
    if (segment.x === food.x && segment.y === food.y) {
      generateFood();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  // Draw grid lines if enabled
  if (gridToggle.checked) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < canvas.width; i += grid) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
  }

  // Draw snake (pink with a darker pink outline)
  ctx.fillStyle = '#ffc0cb'; // Light pink for the snake's body
  ctx.strokeStyle = '#e91e63'; // Dark pink outline
  snake.forEach((segment, index) => {
    ctx.fillRect(segment.x, segment.y, grid, grid);
    ctx.strokeRect(segment.x, segment.y, grid, grid);
    // Draw the head with a different color/style for visibility
    if (index === 0) {
      ctx.fillStyle = '#ff4081'; // Pink accent for the head
      ctx.fillRect(segment.x, segment.y, grid, grid);
    }
  });

  // Draw food (darker pink circle)
  ctx.fillStyle = '#c2185b';
  ctx.beginPath();
  ctx.arc(food.x + grid / 2, food.y + grid / 2, grid / 2, 0, 2 * Math.PI);
  ctx.fill();
}

function update() {
  if (isPaused || isGameOver) return;

  // Move the snake head
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  snake.unshift(head);

  // Check for collision with food
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreDisplay.textContent = score;
    updateLevel();
    if (soundToggle.checked) eatSound.play();
    generateFood();
  } else {
    snake.pop(); // Remove tail if no food is eaten
  }

  // Check for collisions with walls or itself
  if (checkCollision()) {
    endGame();
    return;
  }
}

function main() {
  update();
  draw();
  gameLoop = setTimeout(main, gameSpeed);
}

function checkCollision() {
  const head = snake[0];
  // Wall collision
  if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
    return true;
  }
  // Self collision
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      return true;
    }
  }
  return false;
}

function resetGame() {
  isGameOver = false;
  isPaused = false;
  clearTimeout(gameLoop);
  snake = [{ x: 200, y: 200 }];
  direction = { x: grid, y: 0 };
  lastDirection = { x: grid, y: 0 };
  score = 0;
  gameSpeed = parseInt(gameSpeedSelect.value);

  scoreDisplay.textContent = score;
  snakeLengthDisplay.textContent = snake.length;
  levelDisplay.textContent = '1';
  canvasOverlay.classList.remove('hidden');
  gameOverOverlay.classList.remove('visible');
  instructionsOverlay.classList.remove('visible');
  pauseOverlay.classList.remove('visible');
}

function startGame() {
  if (isGameOver) resetGame();
  if (!gameLoop || isPaused) {
    isPaused = false;
    canvasOverlay.classList.add('hidden');
    pauseOverlay.classList.remove('visible');
    main();
  }
}

function togglePause() {
  if (isGameOver || initialGameLoad) return;
  isPaused = !isPaused;
  if (isPaused) {
    clearTimeout(gameLoop);
    pauseOverlay.classList.add('visible');
  } else {
    pauseOverlay.classList.remove('visible');
    main();
  }
}

function endGame() {
  isGameOver = true;
  clearTimeout(gameLoop);
  if (soundToggle.checked) gameOverSound.play();

  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
    highScoreDisplay.textContent = highScore;
    document.getElementById('footerHighScore').textContent = highScore;
  }

  // Update modal stats
  finalScoreDisplay.textContent = score;
  modalHighScoreDisplay.textContent = highScore;
  snakeLengthDisplay.textContent = snake.length;
  
  gameOverOverlay.classList.add('visible');
}

function updateLevel() {
  let level = Math.floor(score / 50) + 1;
  levelDisplay.textContent = level;
  // Increase speed every 2 levels
  if (level % 2 === 0) {
    gameSpeed = Math.max(50, gameSpeed - 5);
  }
}

/*
 * * * --- Event Listeners ---
 * * */
document.addEventListener('keydown', e => {
  if (initialGameLoad) {
    initialGameLoad = false;
    generateFood();
    startGame();
  }

  if (e.code === 'Space') {
    togglePause();
  }
  if (e.code === 'KeyR') {
    resetGame();
  }
  
  // Prevent snake from reversing
  if (e.code === 'ArrowUp' && lastDirection.y === 0) {
    direction = { x: 0, y: -grid };
  } else if (e.code === 'ArrowDown' && lastDirection.y === 0) {
    direction = { x: 0, y: grid };
  } else if (e.code === 'ArrowLeft' && lastDirection.x === 0) {
    direction = { x: -grid, y: 0 };
  } else if (e.code === 'ArrowRight' && lastDirection.x === 0) {
    direction = { x: grid, y: 0 };
  }
  lastDirection = { ...direction };
});

// Mobile controls
if (isMobile) {
  mobileControls.style.display = 'flex';
  document.getElementById('upBtn').addEventListener('click', () => {
    if (lastDirection.y === 0) direction = { x: 0, y: -grid };
    lastDirection = { ...direction };
  });
  document.getElementById('downBtn').addEventListener('click', () => {
    if (lastDirection.y === 0) direction = { x: 0, y: grid };
    lastDirection = { ...direction };
  });
  document.getElementById('leftBtn').addEventListener('click', () => {
    if (lastDirection.x === 0) direction = { x: -grid, y: 0 };
    lastDirection = { ...direction };
  });
  document.getElementById('rightBtn').addEventListener('click', () => {
    if (lastDirection.x === 0) direction = { x: grid, y: 0 };
    lastDirection = { ...direction };
  });
}

// UI Buttons
startGameBtn.addEventListener('click', () => {
  instructionsOverlay.classList.remove('visible');
  initialGameLoad = false;
  generateFood();
  startGame();
});

playAgainBtn.addEventListener('click', () => {
  resetGame();
  generateFood();
  startGame();
});

backToMenuBtn.addEventListener('click', () => {
  resetGame();
  instructionsOverlay.classList.add('visible');
  initialGameLoad = true;
});

resumeBtn.addEventListener('click', togglePause);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
infoBtn.addEventListener('click', () => instructionsOverlay.classList.add('visible'));

startBtn.addEventListener('click', () => {
  initialGameLoad = false;
  generateFood();
  startGame();
});

// Settings
gameSpeedSelect.addEventListener('change', e => {
  gameSpeed = parseInt(e.target.value);
});

// Initial setup
instructionsOverlay.classList.add('visible');