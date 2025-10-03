import { Cell, CellType } from "../core/types.js";
import { randInt } from "../core/utils.js";

export class PhasePlaceSpecialCells {
  constructor({ supplies = 20, traps = 15, supplyRange = [5,20], trapRange = [-15,-3], blocked = [] }) {
    this.id = "place-special-cells";
    this.supplies = supplies;
    this.traps = traps;
    this.supplyRange = supplyRange;
    this.trapRange = trapRange;
    this.blocked = blocked; // array of {x,y} to avoid (e.g., start, exit)
  }

  isBlocked(x, y) { return this.blocked.some(p => p.x === x && p.y === y); }

  drop(board, count, mkCell) {
    let placed = 0;
    while (placed < count) {
      const x = randInt(0, board.size - 1);
      const y = randInt(0, board.size - 1);
      if (board.isEmpty(x, y) && !this.isBlocked(x, y)) {
        board.set(x, y, mkCell());
        placed++;
      }
    }
  }

  async apply({ board }) {
    const [sMin, sMax] = this.supplyRange;
    const [tMin, tMax] = this.trapRange; // negative numbers e.g. -15..-3

    this.drop(board, this.supplies, () => new Cell(
      CellType.SUPPLY, randInt(sMin, sMax)
    ));

    this.drop(board, this.traps, () => new Cell(
      CellType.TRAP, randInt(tMin, tMax) // already negative
    ));
  }
}
