// The core never imports concrete phases/strategies/renderers.
// It only calls their minimal interfaces.

export class Engine {
  constructor({ board, ctx, phases = [], renderer = null }) {
    this.board = board;
    this.ctx = ctx;              // shared mutable game context (score, pos, etc.)
    this.phases = phases;        // array of { id, apply({board,ctx,emit}) }
    this.renderer = renderer;    // { render(board, ctx) }
    this.listeners = {};         // simple event bus
  }

  on(event, handler) {
    (this.listeners[event] ??= []).push(handler);
  }

  emit(event, payload) {
    (this.listeners[event] || []).forEach(fn => fn(payload));
  }

  async run() {
    for (const phase of this.phases) {
      await phase.apply({ board: this.board, ctx: this.ctx, emit: this.emit.bind(this) });
      if (this.renderer?.render) this.renderer.render(this.board, this.ctx);
    }
  }
}
