// Strategy: scoring depends on cell.value (positive or negative)
export class ScoringByCellValue {
  onCellEntered({ cell, ctx }) {
    ctx.score += cell.value;
  }
}
