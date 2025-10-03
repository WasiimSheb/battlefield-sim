import { CellType } from "../core/types.js";

export class AsciiRenderer {
  render(board, ctx) {
    const rows = [];
    for (let y = 0; y < board.size; y++) {
      const row = [];
      for (let x = 0; x < board.size; x++) {
        if (x === ctx.player.x && y === ctx.player.y) { row.push("P"); continue; }
        const t = board.get(x, y).type;
        row.push(t === CellType.EMPTY ? "." :
                 t === CellType.SUPPLY ? "C" :
                 t === CellType.TRAP   ? "M" :
                 t === CellType.EXIT   ? "O" : "?");
      }
      rows.push(row.join(" "));
    }
    console.clear?.();
    console.log(rows.join("\n"));
    console.log(`Score: ${ctx.score}`);
  }
}
