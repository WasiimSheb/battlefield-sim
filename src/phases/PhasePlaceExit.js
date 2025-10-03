import { Cell, CellType } from "../core/types.js";

export class PhasePlaceExit {
  constructor({ exit }) {
    this.id = "place-exit";
    this.exit = exit; // {x,y}
  }
  async apply({ board }) {
    board.set(this.exit.x, this.exit.y, new Cell(CellType.EXIT, 0));
  }
}
