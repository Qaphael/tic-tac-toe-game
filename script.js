const board = ["", "", "", "", "", "", "", "", ""];
const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const cells = document.querySelectorAll(".cell");
const message = document.getElementById("message");
const messageTwo = document.querySelector(".top-message");
const playerScore = document.getElementById("player-score");
const cpuScore = document.getElementById("cpu-score");
const tieScore = document.getElementById("tie-score");
const resetScoresButton = document.querySelector("#reset-button");
const clearCounterButton = document.querySelector("#clear-counter");
const popup = document.querySelector(".message-container");
const overlay = document.querySelector(".overlay");

const xImage = new Image();
xImage.src = "x.png";
const oImage = new Image();
oImage.src = "o.png";

let currentPlayer = "X";
let gameOver = false;
let playerWins = getPlayerWins();
let cpuWins = getCpuWins();
let ties = getTies();
let moveDelay = "600";

function makeMove(index) {
  if (board[index] === "" && !gameOver) {
    board[index] = currentPlayer;
    cells[index].innerHTML =
      currentPlayer === "X"
        ? `<img src="${xImage.src}" alt="X">`
        : `<img src="${oImage.src}" alt="O">`;

    if (checkWin(currentPlayer)) {
      highlightWinningMove();
      setTimeout(openPopup, 1000);
      message.innerText = `${currentPlayer} TAKES THE ROUND!`;
      changeLetters();
      gameOver = true;
      updateScores(currentPlayer);
      saveGameState();
      return;
    }

    if (board.filter((cell) => cell === "").length === 0) {
      setTimeout(openPopup, 1000);
      message.innerText = "It's a tie!";
      changeLetters();
      gameOver = true;
      ties++;
      updateScores();
      saveGameState();
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    if (currentPlayer === "O") {
      makeCPUMove();
    }
    saveGameState();
  }
}

function makeCPUMove() {
  let bestMove;

  // Check for winning move
  bestMove = checkForMove(currentPlayer);
  if (bestMove === -1) {
    // Check for blocking move
    bestMove = checkForMove("X");
    if (bestMove === -1) {
      // Play a random spot
      const availableMoves = getAvailableMoves();
      bestMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }

  setTimeout(() => {
    makeMove(bestMove);
  }, moveDelay);
}

function checkForMove(player) {
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    if (board[a] === player && board[b] === player && board[c] === "") {
      return c;
    } else if (board[a] === player && board[b] === "" && board[c] === player) {
      return b;
    } else if (board[a] === "" && board[b] === player && board[c] === player) {
      return a;
    }
  }
  return -1;
}

function getAvailableMoves() {
  return board.reduce((moves, cell, index) => {
    if (cell === "") {
      moves.push(index);
    }
    return moves;
  }, []);
}

function checkWin(player) {
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}

function highlightWinningMove() {
  for (let i = 0; i < winningCombinations.length; i++) {
    const [a, b, c] = winningCombinations[i];
    if (
      board[a] === currentPlayer &&
      board[b] === currentPlayer &&
      board[c] === currentPlayer
    ) {
      cells[a].classList.add("win");
      cells[b].classList.add("win");
      cells[c].classList.add("win");
      break;
    }
  }
}

function updateScores(winner) {
  if (winner === "X") {
    playerWins++;
  } else if (winner === "O") {
    cpuWins++;
  }
  playerScore.innerHTML = `<span class="player-name">X(YOU)</span><span  class="score">${playerWins}</span>`;
  cpuScore.innerHTML = `<span class="player-name">O(CPU)</span><span class="score">${cpuWins}</span>`;
  tieScore.innerHTML = `<span class="player-name">TIES</span><span class="score">${ties}</span>`;
  saveCounters();
}

function resetGame() {
  board.fill("");
  currentPlayer = "X";
  gameOver = false;
  message.innerText = "";
  messageTwo.innerText = "";
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerHTML = "";
    cells[i].classList.remove("win");
  }
  saveGameState();
}

function openPopup() {
  popup.classList.add("active");
  overlay.classList.add("active");
}

function closePopup() {
  popup.classList.remove("active");
  overlay.classList.remove("active");
}

function resetScores() {
  playerWins = 0;
  cpuWins = 0;
  ties = 0;
  playerScore.innerHTML = `<span class="player-name">X(YOU)</span><span  class="score">${playerWins}</span>`;
  cpuScore.innerHTML = `<span class="player-name">O(CPU)</span><span class="score">${cpuWins}</span>`;
  tieScore.innerHTML = `<span class="player-name">TIES</span><span class="score">${ties}</span>`;
  saveCounters();
}

function clearCounters() {
  localStorage.removeItem("ticTacToePlayerWins");
  localStorage.removeItem("ticTacToeCpuWins");
  localStorage.removeItem("ticTacToeTies");
  resetScores();
}

function saveGameState() {
  const gameState = {
    board: board,
    currentPlayer: currentPlayer,
    gameOver: gameOver,
  };
  localStorage.setItem("ticTacToeGameState", JSON.stringify(gameState));
}

function loadGameState() {
  const gameState = JSON.parse(localStorage.getItem("ticTacToeGameState"));
  if (gameState) {
    board.splice(0, gameState.board.length, ...gameState.board);
    currentPlayer = gameState.currentPlayer;
    gameOver = gameState.gameOver;

    for (let i = 0; i < cells.length; i++) {
      cells[i].innerHTML =
        gameState.board[i] === "X"
          ? `<img src="${xImage.src}" alt="X">`
          : gameState.board[i] === "O"
          ? `<img src="${oImage.src}" alt="O">`
          : "";
      cells[i].classList.remove("win");
    }

    if (gameOver) {
      message.innerText =
        gameState.currentPlayer === "X"
          ? `${currentPlayer} TAKES THE ROUND!`
          : "It's a tie!";
      if (currentPlayer === "X") {
        highlightWinningMove();
      }
    }

    if (currentPlayer === "O" && !gameOver) {
      makeCPUMove();
    }
  }
}

function saveCounters() {
  localStorage.setItem("ticTacToePlayerWins", playerWins.toString());
  localStorage.setItem("ticTacToeCpuWins", cpuWins.toString());
  localStorage.setItem("ticTacToeTies", ties.toString());
}

function getPlayerWins() {
  const playerWinsData = localStorage.getItem("ticTacToePlayerWins");
  return playerWinsData ? parseInt(playerWinsData) : 0;
}

function getCpuWins() {
  const cpuWinsData = localStorage.getItem("ticTacToeCpuWins");
  return cpuWinsData ? parseInt(cpuWinsData) : 0;
}

function getTies() {
  const tiesData = localStorage.getItem("ticTacToeTies");
  return tiesData ? parseInt(tiesData) : 0;
}

function changeLetters() {
  const msg = document.getElementById("message");
  const msgContent = msg.textContent;
  const letter = "x";
  const secondLetter = "o";
  const smileEmoji = "\u{1F60A}";
  const sadEmoji = "\u{1F614}";
  const sweatEmoji = "\u{1F613}";

  if (msgContent.charAt(0).toUpperCase() === letter.toUpperCase()) {
    messageTwo.textContent = "You won, yay! " + smileEmoji;
  } else if (
    msgContent.charAt(0).toUpperCase() === secondLetter.toUpperCase()
  ) {
    messageTwo.textContent = "You lost! " + sadEmoji;
  } else {
    messageTwo.textContent = "You tied, try harder! " + sweatEmoji;
  }
}

// Add event listeners to cells
for (let i = 0; i < cells.length; i++) {
  cells[i].addEventListener("click", () => makeMove(i));
}

resetScoresButton.addEventListener("click", resetGame);
clearCounterButton.addEventListener("click", clearCounters);

window.addEventListener("load", () => {
  loadGameState();
  playerScore.innerHTML = `<span class="player-name">X(YOU)</span><span  class="score">${playerWins}</span>`;
  cpuScore.innerHTML = `<span class="player-name">O(CPU)</span><span class="score">${cpuWins}</span>`;
  tieScore.innerHTML = `<span class="player-name">TIES</span><span class="score">${ties}</span>`;
});
