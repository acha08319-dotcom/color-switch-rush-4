// InputManager.ts — Handles all player input for color cycling
// One action: "cycleColor" triggered by tap, click, or spacebar
// Design philosophy: semantic input, no raw key checks in gameplay code

import { Engine } from "@babylonjs/core/Engines/engine";

export class InputManager {
  private onCycle: () => void;
  private onPause: () => void;
  private listeners: (() => void)[] = [];

  constructor(onCycle: () => void, onPause: () => void = () => undefined) {
    this.onCycle = onCycle;
    this.onPause = onPause;
  }

  attach(engine: Engine, canvas: HTMLCanvasElement): void {
    // Mouse/touch click anywhere
    const clickHandler = () => this.onCycle();

    // Keyboard: spacebar
    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        this.onCycle();
      } else if (e.code === "Escape") {
        // Escape is intentionally not prevented; Playables and browsers may use it too.
        this.onPause();
      }
    };

    canvas.addEventListener("pointerdown", clickHandler);
    window.addEventListener("keydown", keyHandler);

    this.listeners.push(() => {
      canvas.removeEventListener("pointerdown", clickHandler);
      window.removeEventListener("keydown", keyHandler);
    });
  }

  detach(): void {
    for (const cleanup of this.listeners) cleanup();
    this.listeners = [];
  }
}
