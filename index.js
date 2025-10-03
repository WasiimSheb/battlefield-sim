// battlefield-sim/index.js

// === Config (easy to tweak) ===
const BOARD_SIZE = 15;
const NUM_SUPPLIES = 20;
const NUM_TRAPS = 15;

const START = { x: 0, y: 0 };
const EXIT = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

// Scoring & rules
const SCORE_SUPPLY = +10;   // points per collected supply
const SCORE_TRAP = -5;      // penalty per mine hit
const ALLOW_STEP_ON_TRAP = true; // true = you can step on mines (dangerous), false = blocked

// Rendering
const CELL_EMPTY = " ";
const CELL_SUPPLY = "C";
const CELL_TRAP = "M";      // hidden until stepped; printed as "." until revealed
const CELL_EXIT = "O";
const CELL_PLAYER = "P";
const CELL_PATH = ".";      // trail of visited cells

// Example move sequence (U,D,L,R)
const moves = ["R","R","D","D","L","D","R"];

// === State ===
const player = {
  x: START.x,
  y: START.y,
  score: 0,
  suppliesCollected: 0,
  trapsHit: 0,
  path: [] // array of {x,y}
};

// === Utilities ===
function randInt(min, max) { // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function key(x, y) { return `${x},${y}`; }

// === Board creation ===
function createEmptyBoard() {
  // Represent each cell as { type: string, revealed: boolean }
  // revealed = whether the “true” content was seen (used for traps that are hidden)
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ type: CELL_EMPTY, revealed: false }))
  );
}

function placeItems(board, symbol, count, forbidden = new Set()) {
  let placed = 0;
  while (placed < count) {
    const x = randInt(0, BOARD_SIZE - 1);
    const y = randInt(0, BOARD_SIZE - 1);
    const k = key(x, y);
    if (forbidden.has(k)) continue;
    if (board[x][y].type !== CELL_EMPTY) continue;
    board[x][y].type = symbol;
    placed++;
  }
}

function generateBoard() {
  const board = createEmptyBoard();

  // Reserve start & exit
  const blocked = new Set([key(START.x, START.y), key(EXIT.x, EXIT.y)]);

  // Place supplies and mines (no overlap, not on start/exit)
  placeItems(board, CELL_SUPPLY, NUM_SUPPLIES, blocked);
  placeItems(board, CELL_TRAP, NUM_TRAPS, blocked);

  // Mark exit
  board[EXIT.x][EXIT.y].type = CELL_EXIT;

  // Reveal the start (for nicer printing)
  board[START.x][START.y].revealed = true;

  return board;
}

// === Rendering ===
function printBoard(board, player) {
  // We’ll show traps as "." (hidden) unless revealed by stepping on them
  const rows = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    const row = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      let ch = CELL_EMPTY;

      const isPlayer = (x === player.x && y === player.y);
      if (isPlayer) {
        ch = CELL_PLAYER;
      } else {
        const cell = board[x][y];
        if (cell.revealed) {
          // reveal true type
          ch = cell.type === CELL_EMPTY ? CELL_PATH : cell.type;
        } else {
          // hide mines; everything else shows as blank
          if (cell.type === CELL_EXIT) ch = CELL_EXIT;
          else ch = CELL_EMPTY;
        }
      }

      row.push(ch);
    }
    rows.push(row.join(" "));
  }

  console.log(rows.map(r => r).join("\n"));
  console.log(
    `\nPos=(${player.x},${player.y}) | Score=${player.score} | Supplies=${player.suppliesCollected}/${NUM_SUPPLIES} | Traps hit=${player.trapsHit}\n`
  );
}

// === Game mechanics ===
function inBounds(x, y) {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

function evaluateCell(cell, player) {
  // Apply effects of stepping into this cell.
  // Returns: { status: "continue" | "exit" }
  if (cell.type === CELL_SUPPLY) {
    player.suppliesCollected += 1;
    player.score += SCORE_SUPPLY;
    // consume supply
    cell.type = CELL_EMPTY;
  } else if (cell.type === CELL_TRAP) {
    player.trapsHit += 1;
    player.score += SCORE_TRAP;
    // reveal trap after hit (so it renders as M from now on)
    cell.revealed = true;
    // If you prefer mines to block movement instead, set ALLOW_STEP_ON_TRAP=false and handle in applyMove.
  } else if (cell.type === CELL_EXIT) {
    // reaching exit ends the mission
    return { status: "exit" };
  }

  return { status: "continue" };
}

function applyMove(player, direction, board) {
  // Compute intended next position
  let nx = player.x;
  let ny = player.y;

  switch (direction) {
    case "U": nx -= 1; break;
    case "D": nx += 1; break;
    case "L": ny -= 1; break;
    case "R": ny += 1; break;
    default:
      console.log(`Ignoring invalid move '${direction}'`);
      return { status: "continue" };
  }

  // Boundaries
  if (!inBounds(nx, ny)) {
    // Out of bounds: ignore move (or penalize if you want)
    // console.log("Bumped into boundary.");
    return { status: "continue" };
  }

  const nextCell = board[nx][ny];

  // If mines are not allowed to be stepped on, block here
  if (!ALLOW_STEP_ON_TRAP && nextCell.type === CELL_TRAP) {
    // console.log("Blocked by a hidden mine.");
    return { status: "continue" };
  }

  // Record path (mark current cell as revealed/path)
  board[player.x][player.y].revealed = true;
  player.path.push({ x: player.x, y: player.y });

  // Move player
  player.x = nx;
  player.y = ny;

  // Reveal destination cell and apply effects
  nextCell.revealed = true;
  const result = evaluateCell(nextCell, player);
  return result;
}

// === Main loop ===
function main() {
  const board = generateBoard();

  console.log("=== Initial Board ===");
  printBoard(board, player);

  for (const step of moves) {
    const res = applyMove(player, step, board);
    printBoard(board, player);
    if (res.status === "exit") {
      console.log("✅ Reached EXIT! Mission complete.");
      break;
    }
  }

  console.log("=== Summary ===");
  console.log({
    finalPosition: { x: player.x, y: player.y },
    score: player.score,
    suppliesCollected: player.suppliesCollected,
    trapsHit: player.trapsHit,
    pathLength: player.path.length
  });
}

main();
