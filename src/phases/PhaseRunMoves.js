import { GameEvent } from "../core/types.js";
import { inBounds } from "../core/utils.js";

const step = (pos, dir) => {
  if (dir === "U") return { x: pos.x,     y: pos.y - 1 };
  if (dir === "D") return { x: pos.x,     y: pos.y + 1 };
  if (dir === "L") return { x: pos.x - 1, y: pos.y     };
  if (dir === "R") return { x: pos.x + 1, y: pos.y     };
  return pos;
};

export class PhaseRunMoves {
  constructor({ moves, scoringStrategy }) {
    this.id = "run-moves";
    this.moves = moves;
    this.scoring = scoringStrategy; // { onCellEntered({cell,ctx})? }
  }

  async apply({ board, ctx, emit }) {
    for (const m of this.moves) {
      const next = step(ctx.player, m);
      if (!inBounds(next.x, next.y, board.size)) continue; // ignore out-of-bounds

      ctx.player = next;
      emit(GameEvent.MOVE_APPLIED, { move: m, to: next });

      const cell = board.get(next.x, next.y);
      if (this.scoring?.onCellEntered) {
        this.scoring.onCellEntered({ cell, ctx });
        emit(GameEvent.SCORE_CHANGED, { delta: cell.value, score: ctx.score });
      }
      emit(GameEvent.CELL_ENTERED, { pos: next, cell });
    }
  }
}
