// Cell & event "contracts" (tiny, stable)
export const CellType = Object.freeze({
  EMPTY: "EMPTY",
  SUPPLY: "SUPPLY",
  TRAP: "TRAP",
  EXIT: "EXIT",
  PLAYER: "PLAYER", // virtual (for rendering)
});

export class Cell {
  constructor(type = CellType.EMPTY, value = 0, meta = {}) {
    this.type = type;
    this.value = value;   // e.g., +7 for supply, -12 for trap
    this.meta = meta;     // any extra info plugins want to stash
  }
}

// Event bus message shapes (kept minimal; extend by adding new event types)
export const GameEvent = Object.freeze({
  CELL_ENTERED: "CELL_ENTERED",
  MOVE_APPLIED: "MOVE_APPLIED",
  SCORE_CHANGED: "SCORE_CHANGED",
});
