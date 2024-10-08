console.log("Hello, World!");

const Gameboard = (() => {
  let board = ["", "", "", "", "", "", "", "", ""];

  const getBoard = () => board;

  const setBoard = (index, marker) => {
    if (board[index] === "") {
      board[index] = marker;
      return true;
    } else {
      alert("Spot taken!");
      return false;
    }
  };

  const resetBoard = () => {
    board = ["", "", "", "", "", "", "", "", ""];
    return board;
  };

  return { 
    getBoard, 
    setBoard, 
    resetBoard 
  };
})();

const Player = (name, marker) => {
  const playerName = name;
  const playerMarker = marker.toUpperCase();

  const getName = () => playerName;
  const getMarker = () => playerMarker;

  return {
    getName, 
    getMarker
  };
};


const Game = (name1, name2) => {
  // Initialize players
  const player1 = Player(name1, "X");
  const player2 = Player(name2, "O");
  let currentPlayer = player1;
  let gameOver = false;

  // Initialize gameboard
  const board = Gameboard;

  // Get current player method
  const getCurrentPlayer = () => currentPlayer;

  // Get state of gameOver
  const isGameOver = () => gameOver;

  // Play a turn (playing marker on board)
  const playTurn = (index) => {
    if (gameOver) return;

    if (board.setBoard(index, currentPlayer.getMarker())) {  // Check if move is valid
      if (checkWin()) {
        displayController.displayMessage(`${currentPlayer.getName()} wins!`);
        displayController.showReplay();
        gameOver = true;
        return;
      }
      if (checkTie()) {
        displayController.displayMessage("It's a tie!");
        displayController.showReplay();
        gameOver = true;
        return;
      }
      switchTurn();  // Move to the next player's turn
    }
  };

  // Switch the active player
  const switchTurn = () => {
    currentPlayer = (currentPlayer === player1) ? player2 : player1;
  };

  // Check if there's a winning combination on the board
  const checkWin = () => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],  // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8],  // Columns
      [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    return winningCombinations.some(combination => {
      const [a, b, c] = combination;
      return board.getBoard()[a] !== "" &&
             board.getBoard()[a] === board.getBoard()[b] &&
             board.getBoard()[a] === board.getBoard()[c];
    });
  };

  // Check if all spots are filled, indicating a tie
  const checkTie = () => {
    return board.getBoard().every(spot => spot !== "");
  };

  // Reset the game state and current player
  const resetGame = () => {
    board.resetBoard();
    currentPlayer = player1;
    gameOver = false;
  };

  // Return the public methods
  return { 
    getCurrentPlayer,
    playTurn,
    isGameOver, 
    resetGame
  };
};

// Display controller module handles all methods and needed functions to
// Display and update game state to the HTML UI
const displayController = (() => {
  const htmlBoard = document.querySelector("#container");
  const playerForm = document.querySelector("#playerForm");
  const gameMessages = document.querySelector("#messages");
  
  // Hide player name form and display game board
  const showGameScreen = () => {
    playerForm.classList.add("hidden");    // Hide player form
    htmlBoard.classList.remove("hidden");  // Show game container
  };
  
  // Toggle play again button
  const showReplay = () => {
    const replayButton = document.querySelector("#replayButton");
    replayButton.classList.remove("hidden");
  };

  // Full board render
  const renderBoard = () => {
    const board = Gameboard.getBoard();
    // Update the innerHTML of each spot on the board
    board.forEach((spot, index) => {
      const boardCell = htmlBoard.children[index];
      boardCell.textContent = spot;
    });
  };

  // Update just one cell
  const updateCell = (index, marker) => {
    const cell = document.querySelector(`[data-index='${index}']`);
    if (cell) {
      cell.textContent = marker;
    }
  }
  
  // Clear the board
  const clearBoard = () => {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => cell.textContent = "");
  }

  // Bind events to the html board
  const bindEvents = (gameInstance) => {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
      // For each cell we are adding a "click" event listener that will
      // update our display and also play the turn
      cell.addEventListener("click", () => {
        if (gameInstance.isGameOver()) return;

        const index = cell.dataset.index;
        const marker = gameInstance.getCurrentPlayer().getMarker();

        // Update the cell using displayController method
        displayController.updateCell(index, marker);
        
        // Play the turn and let game logic handle the move
        gameInstance.playTurn(index);
      });
    });
  };

  // Display any message to players (through a div above game board)
  const displayMessage = (message) => {
    gameMessages.textContent = message;
  };

  // Show result to the message container
  const showResult = (winner) => {
    if (winner) {
      displayMessage(`${winner.getName()} wins!`);
    } else {
      displayMessage("It's a tie!");
    }
  };

  // Initialize the board
  const initializeBoard = (gameInstance) => {
    renderBoard();
    bindEvents(gameInstance);
  };

  // Restart the game
  const resetDisplay = () => {
    clearBoard();
    displayMessage("New game! Let's play!");
  };

  return {
    showGameScreen,
    showReplay,
    renderBoard,
    updateCell,
    clearBoard,
    bindEvents,
    displayMessage,
    showResult,
    initializeBoard,
    resetDisplay
  };
})();



// Running logic
const playButton = document.querySelector("#playButton");
const replayButton = document.querySelector("#replayButton");

playButton.addEventListener("click", (event) => {
  event.preventDefault();

  const playerName1 = document.querySelector("#player1").value;
  const playerName2 = document.querySelector("#player2").value;
  
  // Create new Game instance
  const gameInstance = Game(playerName1, playerName2);
  
  // Transition to game screen
  displayController.showGameScreen();

  displayController.initializeBoard(gameInstance);

  // Replay game logic
  replayButton.addEventListener("click", (event) => {
    gameInstance.resetGame();
    displayController.resetDisplay();
    replayButton.classList.add("hidden");
  });
});