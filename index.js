// battlefield-sim/index.js

// === Config ===
const BOARD_SIZE = 15;
const NUM_SUPPLIES = 20;
const NUM_TRAPS = 15;

const START = { x: 0, y: 0 };
const EXIT = { x: BOARD_SIZE - 1, y: BOARD_SIZE - 1 };

// default values for items (used in value field)
const SUPPLY_VALUE = +10;
const TRAP_VALUE = -5;

const ALLOW_STEP_ON_TRAP = true; // if false, movement into TRAP is blocked

// Rendering (just for console view)
const RENDER = {
  START: "S",
  EXIT: "O",
  SUPPLY: "C",
  TRAP: "M",
  EMPTY: " ",
  VISITED: ".",
  PLAYER: "P",
};

// Example move sequence (U,D,L,R)
const moves = ["R", "R", "D", "D", "L", "D", "R"];

// === State ===
const player = {
  x: START.x,
  y: START.y,
  score: 0,
  suppliesCollected: 0,
  trapsHit: 0,
  path: [], // array of {x,y}
};

// === Utilities ===
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function key(x, y) {
  return `${x},${y}`;
}

// === Board creation (object cells) ===
function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => ({ type: "EMPTY", value: 0 }))
  );
}

function placeRandom(board, type, count, value, forbidden = new Set()) {
  let placed = 0;
  while (placed < count) {
    const x = randInt(0, BOARD_SIZE - 1);
    const y = randInt(0, BOARD_SIZE - 1);
    const k = key(x, y);
    if (forbidden.has(k)) continue;
    if (board[x][y].type !== "EMPTY") continue;
    board[x][y] = { type, value };
    placed++;
  }
}

function generateBoard() {
  const board = createEmptyBoard();

  // Fix start & exit
  board[START.x][START.y] = { type: "START", value: 0 };
  board[EXIT.x][EXIT.y] = { type: "EXIT", value: 0 };

  const blocked = new Set([key(START.x, START.y), key(EXIT.x, EXIT.y)]);

  placeRandom(board, "SUPPLY", NUM_SUPPLIES, SUPPLY_VALUE, blocked);
  placeRandom(board, "TRAP", NUM_TRAPS, TRAP_VALUE, blocked);

  return board;
}

// === Rendering ===
function printBoard(board, player) {
  const rows = [];
  for (let x = 0; x < BOARD_SIZE; x++) {
    const row = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      const isPlayer = x === player.x && y === player.y;
      const cell = board[x][y];

      row.push(isPlayer ? RENDER.PLAYER : RENDER[cell.type]);
    }
    rows.push(row.join(" "));
  }

  console.log(rows.join("\n"));
  console.log(
    `\nPos=(${player.x},${player.y}) | Score=${player.score} | Supplies=${player.suppliesCollected}/${NUM_SUPPLIES} | Traps hit=${player.trapsHit}\n`
  );
}

// === Game mechanics ===
function inBounds(x, y) {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
}

function markVisited(cell) {
  if (cell.type !== "START" && cell.type !== "EXIT") {
    cell.type = "VISITED";
    cell.value = 0;
  }
}

function evaluateCell(cell, player) {
  // Returns: { status: "continue" | "exit" }
  if (cell.type === "SUPPLY") {
    player.suppliesCollected += 1;
    player.score += cell.value; // +10
    markVisited(cell);
  } else if (cell.type === "TRAP") {
    player.trapsHit += 1;
    player.score += cell.value; // -5
    markVisited(cell);
  } else if (cell.type === "EXIT") {
    return { status: "exit" };
  } else {
    // EMPTY or VISITED → just convert to VISITED (if not special)
    markVisited(cell);
  }
  return { status: "continue" };
}

function applyMove(player, direction, board) {
  let nx = player.x;
  let ny = player.y;

  switch (direction) {
    case "U":
      nx--;
      break;
    case "D":
      nx++;
      break;
    case "L":
      ny--;
      break;
    case "R":
      ny++;
      break;
    default:
      console.log(`Ignoring invalid move '${direction}'`);
      return { status: "continue" };
  }

  if (!inBounds(nx, ny)) {
    return { status: "continue" }; // ignore out-of-bounds
  }

  const nextCell = board[nx][ny];

  // If traps are blocking, don't enter
  if (!ALLOW_STEP_ON_TRAP && nextCell.type === "TRAP") {
    return { status: "continue" };
  }

  // Leave a path at current position (unless START/EXIT)
  markVisited(board[player.x][player.y]);
  player.path.push({ x: player.x, y: player.y });

  // Move
  player.x = nx;
  player.y = ny;

  // Apply effects of destination
  return evaluateCell(nextCell, player);
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
    pathLength: player.path.length,
  });
}

main();
// End of file