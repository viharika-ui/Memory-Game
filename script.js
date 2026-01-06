const emojiPool = [
  '🍎','🍇','🥥','🍌','🍉','🥝',
  '🍒','🍋','🍊','🍓','🍐','🍈','🍏','🥭','🍑'
];

const levels = {
  easy: { pairs: 6, cols: 4 },
  medium: { pairs: 8, cols: 4 },
  hard: { pairs: 18, cols: 6 }
};

const board = document.getElementById('gameBoard');
const levelScreen = document.getElementById('levelScreen');
const gameScreen = document.getElementById('gameScreen');
const pauseBtn = document.getElementById('pauseBtn');

let currentLevel = '';
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let isPaused = false;

let moves = 0;
let matchedPairs = 0;
let time = 0;
let timer = null;

function getBestTime(level) {
  const data = JSON.parse(localStorage.getItem(`best-${level}`));
  return data ? data.time : null;
}

function setBestTime(level, time) {
  const best = getBestTime(level);
  if (best === null || time < best) {
    localStorage.setItem(`best-${level}`, JSON.stringify({ time }));
  }
}

function updateLevelScreen() {
  ['easy','medium','hard'].forEach(level => {
    const best = getBestTime(level);
    document.getElementById(`best-${level}`).innerText =
      best ? `Best Time: ${best}s` : 'Best Time: --';
  });
}

function startWithLevel(level) {
  currentLevel = level;
  levelScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  document.getElementById('levelTitle').innerText = `Level: ${level.toUpperCase()}`;
  restartGame();
}

function goToLevels() {
  clearInterval(timer);
  gameScreen.classList.add('hidden');
  levelScreen.classList.remove('hidden');
  board.classList.remove('paused');
  pauseBtn.innerText = 'Pause';
  isPaused = false;
  document.getElementById('popup').style.display = 'none';
  updateLevelScreen();
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    time++;
    document.getElementById('timer').innerText = `Time: ${time}s`;
  }, 1000);
}

function startGame() {
  board.innerHTML = '';
  clearInterval(timer);

  const { pairs, cols } = levels[currentLevel];
  board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  const selected = emojiPool.slice(0, pairs);
  const cards = shuffle([...selected, ...selected]);

  cards.forEach(emoji => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.emoji = emoji;
    card.innerHTML = `
      <div class="card-face card-front">❓</div>
      <div class="card-face card-back">${emoji}</div>
    `;
    card.onclick = () => flipCard(card);
    board.appendChild(card);
  });

  startTimer();
}

function flipCard(card) {
  if (isPaused || lockBoard || card === firstCard || card.classList.contains('flipped')) return;

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  checkMatch();
}

function checkMatch() {
  lockBoard = true;
  if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
    matchedPairs++;
    resetTurn();
    if (matchedPairs === levels[currentLevel].pairs) endGame();
  } else {
    setTimeout(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      resetTurn();
    }, 900);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function endGame() {
  clearInterval(timer);
  setBestTime(currentLevel, time);
  document.getElementById('finalStats').innerText =
    `Time: ${time}s | Moves: ${moves}`;
  document.getElementById('popup').style.display = 'flex';
}

function togglePause() {
  if (isPaused) {
    isPaused = false;
    pauseBtn.innerText = 'Pause';
    board.classList.remove('paused');
    startTimer();
  } else {
    isPaused = true;
    pauseBtn.innerText = 'Resume';
    board.classList.add('paused');
    clearInterval(timer);
  }
}

function restartGame() {
  clearInterval(timer);
  moves = 0;
  time = 0;
  matchedPairs = 0;
  isPaused = false;
  pauseBtn.innerText = 'Pause';
  board.classList.remove('paused');
  document.getElementById('timer').innerText = 'Time: 0s';
  startGame();
}


updateLevelScreen();