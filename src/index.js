import { Board } from "./core/Board.js";
import { Engine } from "./core/Engine.js";
import { AsciiRenderer } from "./renderers/AsciiRenderer.js";
import { PhasePlaceExit } from "./phases/PhasePlaceExit.js";
import { PhasePlaceSpecialCells } from "./phases/PhasePlaceSpecialCells.js";
import { PhaseRunMoves } from "./phases/PhaseRunMoves.js";
import { ScoringByCellValue } from "./strategies/ScoringByCellValue.js";

// === Game config (extend by adding entries; no core mods needed) ===
const CONFIG = {
  boardSize: 15,
  start: { x: 0, y: 0 },
  exit:  { x: 14, y: 14 },
  moves: ["R","R","D","D","L","D","R"],
  specials: {
    supplies: 20,
    traps: 15,
    supplyRange: [5, 20],
    trapRange: [-15, -3],
  },
};

const board = new Board(CONFIG.boardSize);
const ctx = {
  player: { ...CONFIG.start },
  score: 0,
  meta: {}, // plugins can stash stuff here
};

const phases = [
  new PhasePlaceExit({ exit: CONFIG.exit }),
  new PhasePlaceSpecialCells({
    supplies: CONFIG.specials.supplies,
    traps: CONFIG.specials.traps,
    supplyRange: CONFIG.specials.supplyRange,
    trapRange: CONFIG.specials.trapRange,
    blocked: [CONFIG.start, CONFIG.exit],
  }),
  new PhaseRunMoves({
    moves: CONFIG.moves,
    scoringStrategy: new ScoringByCellValue(),
  }),
];

const engine = new Engine({
  board,
  ctx,
  phases,
  renderer: new AsciiRenderer(),
});

// Example: listen without changing phases/engine
engine.on("SCORE_CHANGED", ({ score }) => { /* analytics, logs, etc. */ });

engine.run();
