const fs = require('fs');
const path = require('path');

const INPUT_DIR = '100 3D Sudokus';
const OUTPUT_DIR = '100 3D Sudoku Puzzle';

// Difficulty clue ranges
const clueMap = {
  easy: [36, 40],
  medium: [30, 35],
  hard: [22, 30],
  extreme: [17, 21],
};

// Update this object to control split
const difficultySplit = {
  easy: 20,
  medium: 30,
  hard: 30,
  extreme: 20,
};

const deepCopy = board => board.map(row => [...row]);

function getRandomClueCount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function countSolutions(board, limit = 2) {
  let solutions = 0;

  function isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
      if (board[i][col] === num) return false;
      const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
      const boxCol = 3 * Math.floor(col / 3) + (i % 3);
      if (board[boxRow][boxCol] === num) return false;
    }
    return true;
  }

  function solve(board) {
    if (solutions >= limit) return;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === '') {
          for (let num = 1; num <= 9; num++) {
            const n = num.toString();
            if (isValid(board, row, col, n)) {
              board[row][col] = n;
              solve(board);
              board[row][col] = '';
            }
          }
          return;
        }
      }
    }
    solutions++;
  }

  solve(deepCopy(board));
  return solutions;
}

function createPlayablePuzzle(solution, difficulty = 'medium') {
  const puzzle = deepCopy(solution);
  const [minClues, maxClues] = clueMap[difficulty] || clueMap['medium'];
  const clues = getRandomClueCount(minClues, maxClues);
  const blanks = 81 - clues;

  const blanksPerBox = Array(9).fill(Math.floor(blanks / 9));
  let remainder = blanks % 9;

  while (remainder > 0) {
    const i = Math.floor(Math.random() * 9);
    blanksPerBox[i]++;
    remainder--;
  }

  let removed = 0;

  for (let box = 0; box < 9; box++) {
    const boxRow = Math.floor(box / 3);
    const boxCol = box % 3;

    const positions = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const r = boxRow * 3 + i;
        const c = boxCol * 3 + j;
        positions.push([r, c]);
      }
    }

    shuffleArray(positions);
    let removedFromBox = 0;

    for (const [r, c] of positions) {
      if (removedFromBox >= blanksPerBox[box]) break;
      const temp = puzzle[r][c];
      puzzle[r][c] = '';

      if (countSolutions(puzzle, 2) === 1) {
        removedFromBox++;
        removed++;
      } else {
        puzzle[r][c] = temp;
      }
    }
  }

  return puzzle;
}

function getDifficultyForIndex(index, splitMap) {
  let count = 0;
  for (const [diff, amount] of Object.entries(splitMap)) {
    if (index < count + amount) return diff;
    count += amount;
  }
  return 'medium'; // fallback
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const totalFiles = 100;

  for (let i = 1; i <= totalFiles; i++) {
    const filename = `sudoku-${String(i).padStart(3, '0')}.json`;
    const inputPath = path.join(INPUT_DIR, filename);
    const outputPath = path.join(
      OUTPUT_DIR,
      `puzzle-${String(i).padStart(3, '0')}.json`
    );

    const raw = fs.readFileSync(inputPath, 'utf-8');
    const cube = JSON.parse(raw); // Array of 9 boards

    const difficulty = getDifficultyForIndex(i - 1, difficultySplit);
    const playableCube = cube.map(board =>
      createPlayablePuzzle(board, difficulty)
    );

    fs.writeFileSync(outputPath, JSON.stringify(playableCube, null, 2), 'utf-8');
    console.log(`✅ Saved ${outputPath} (${difficulty})`);
  }

  console.log('🎉 Done generating 100 3D Sudoku puzzles!');
}

main();
