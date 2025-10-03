import { Cell, CellType } from "./types.js";

export class Board {
  constructor(size) {
    this.size = size;
    this.grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => new Cell())
    );
  }
  get(x, y) { return this.grid[y][x]; }
  set(x, y, cell) { this.grid[y][x] = cell; }
  isEmpty(x, y) { return this.get(x, y).type === CellType.EMPTY; }
  forEach(cb) {
    for (let y = 0; y < this.size; y++)
      for (let x = 0; x < this.size; x++)
        cb(x, y, this.grid[y][x]);
  }
}
