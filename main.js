const fs = require('fs');
const path = require('path');

// Create output directory if not exists
const outputDir = path.join(__dirname, '100 3D Sudokus');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// === Sudoku Generation Utilities ===

function isSafe(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num || board[x][col] === num) return false;
  }

  const startRow = row - row % 3;
  const startCol = col - col % 3;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSudoku() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  solveSudoku(board);
  return board;
}

function transformSudoku(board, shift) {
  return board.map(row =>
    row.map(cell => (((cell - 1 + shift) % 9) + 1).toString())
  );
}

// === Main Loop to Generate 100 Files ===

for (let i = 1; i <= 100; i++) {
  const baseBoard = generateSudoku();
  const allBoards = [];

  // Add base board
  allBoards.push(baseBoard.map(row => row.map(cell => cell.toString())));

  // Add 8 shifted variants
  for (let shift = 1; shift <= 8; shift++) {
    const variant = transformSudoku(baseBoard, shift);
    allBoards.push(variant);
  }

  const filename = `sudoku-${String(i).padStart(3, '0')}.json`;
  const filePath = path.join(outputDir, filename);

  fs.writeFileSync(filePath, JSON.stringify(allBoards, null, 2), 'utf8');
  console.log(`✔ Saved ${filename}`);
}

console.log('✅ All 100 Sudoku files generated in "100 3D Sudokus"');
