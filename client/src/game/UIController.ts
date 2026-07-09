// UIController.ts — DOM-based HUD overlay for Color Switch Rush
// Score top-right, multiplier/combo top-center (gold glow), combo counter
// Game over screen with final score, multiplier, and replay button

import { COLORS } from "./types";

const COLORS_HEX = COLORS.map((c) => c.hex);

export class UIController {
  private container: HTMLElement | null = null;

  constructor() {}

  mount(canvas: HTMLCanvasElement): void {
    this.container = document.createElement("div");
    this.container.id = "game-hud";
    this.container.style.cssText = `
      position: fixed; inset: 0; pointer-events: none; z-index: 100;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      user-select: none; overflow: hidden;
    `;
    document.body.appendChild(this.container);
  }

  unmount(): void {
    this.container?.remove();
    this.container = null;
  }

  dispose(): void {
    this.unmount();
  }

  /** Show the HUD overlay during gameplay (score, multiplier, combo) */
  showGameOverlay(): void {
    const hud = this.container;
    if (!hud) return;
    hud.innerHTML = "";

    // Score (top-right) — large, bold, high contrast
    const scoreEl = document.createElement("div");
    scoreEl.id = "hud-score";
    scoreEl.style.cssText = `
      position: absolute; top: 24px; right: 28px;
      font-size: 52px; font-weight: 800; color: #fff;
      text-shadow: 0 0 20px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.5);
    `;
    scoreEl.textContent = "0";
    hud.appendChild(scoreEl);

    // Multiplier + combo (top-center)
    const multEl = document.createElement("div");
    multEl.id = "hud-multiplier";
    multEl.style.cssText = `
      position: absolute; top: 20px; left: 50%;
      transform: translateX(-50%);
      font-size: 30px; font-weight: 800;
      color: #FFD60A;
      text-shadow: 0 0 18px rgba(255,214,10,0.6), 0 2px 4px rgba(0,0,0,0.5);
      display: flex; align-items: center; gap: 6px;
      white-space: nowrap;
    `;
    multEl.textContent = "1x";
    hud.appendChild(multEl);

    // Combo counter (just below multiplier)
    const comboEl = document.createElement("div");
    comboEl.id = "hud-combo";
    comboEl.style.cssText = `
      position: absolute; top: 56px; left: 50%;
      transform: translateX(-50%);
      font-size: 16px; font-weight: 600;
      color: rgba(255,214,10,0.7);
      letter-spacing: 1px;
    `;
    comboEl.textContent = "COMBO 0";
    hud.appendChild(comboEl);
  }

  updateScore(score: number, multiplier: number): void {
    const hud = this.container;
    if (!hud) return;

    const scoreEl = hud.querySelector("#hud-score") as HTMLElement;
    if (scoreEl) {
      scoreEl.textContent = score.toString();
      // Pop animation on score update
      scoreEl.style.transition = "transform 0.1s ease";
      scoreEl.style.transform = "scale(1.15)";
      setTimeout(() => { scoreEl.style.transform = "scale(1)"; }, 100);
    }

    const multEl = hud.querySelector("#hud-multiplier") as HTMLElement;
    if (multEl) {
      multEl.textContent = `${multiplier}x`;
      if (multiplier >= 3) {
        multEl.style.fontSize = "36px";
        multEl.style.color = "#FFA500";
        multEl.style.textShadow = "0 0 30px rgba(255,165,0,0.9), 0 2px 4px rgba(0,0,0,0.5)";
      } else if (multiplier >= 5) {
        multEl.style.fontSize = "40px";
        multEl.style.color = "#FF6B6B";
        multEl.style.textShadow = "0 0 40px rgba(255,107,107,0.9), 0 2px 4px rgba(0,0,0,0.5)";
      } else {
        multEl.style.fontSize = "30px";
        multEl.style.color = "#FFD60A";
        multEl.style.textShadow = "0 0 18px rgba(255,214,10,0.6), 0 2px 4px rgba(0,0,0,0.5)";
      }
    }

    // Combo counter
    const comboEl = hud.querySelector("#hud-combo") as HTMLElement;
    if (comboEl) {
      comboEl.textContent = `COMBO ${multiplier}`;
    }
  }

  /** Show the start menu */
  showMenu(highScore: number, onStart: () => void): void {
    const hud = this.container;
    if (!hud) return;
    hud.innerHTML = "";

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      pointer-events: none;
      background: radial-gradient(ellipse at center, rgba(10,10,46,0.80) 0%, rgba(5,5,20,0.92) 100%);
    `;

    // Inject pulse animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes hudPulse { 0%, 100% { transform: scale(1); box-shadow: 0 4px 20px rgba(155,93,229,0.4); } 50% { transform: scale(1.03); box-shadow: 0 6px 30px rgba(155,93,229,0.6); } }
    `;
    overlay.appendChild(style);

    // Title
    const title = document.createElement("h1");
    title.textContent = "COLOR SWITCH";
    title.style.cssText = `
      font-size: 56px; font-weight: 900; color: #fff;
      margin: 0 0 8px 0; letter-spacing: -1px;
      text-shadow: 0 0 40px rgba(155,93,229,0.6), 0 4px 8px rgba(0,0,0,0.5);
    `;
    overlay.appendChild(title);

    const subtitle = document.createElement("h2");
    subtitle.textContent = "RUSH";
    subtitle.style.cssText = `
      font-size: 28px; font-weight: 700; color: #9B5DE5;
      margin: 0 0 28px 0; letter-spacing: 4px;
      text-shadow: 0 0 20px rgba(155,93,229,0.4);
    `;
    overlay.appendChild(subtitle);

    // Color dots
    const dotsDiv = document.createElement("div");
    dotsDiv.style.cssText = `
      display: flex; gap: 14px; margin-bottom: 36px;
      align-items: center;
    `;
    for (const c of COLORS_HEX) {
      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 18px; height: 18px; border-radius: 50%;
        background: ${c}; box-shadow: 0 0 12px ${c}80;
      `;
      dotsDiv.appendChild(dot);
    }
    overlay.appendChild(dotsDiv);

    // High score
    if (highScore > 0) {
      const hs = document.createElement("div");
      hs.textContent = `Best: ${highScore}`;
      hs.style.cssText = `
        font-size: 18px; color: #FFD60A; font-weight: 600;
        margin-bottom: 20px;
      `;
      overlay.appendChild(hs);
    }

    // Start button
    const btn = document.createElement("button");
    btn.id = "hud-start-btn";
    btn.textContent = "TAP TO PLAY";
    btn.style.cssText = `
      padding: 16px 52px; font-size: 22px; font-weight: 700;
      color: #fff; background: linear-gradient(135deg, #9B5DE5, #00B4D8);
      border: none; border-radius: 12px; cursor: pointer;
      box-shadow: 0 4px 20px rgba(155,93,229,0.4);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      pointer-events: auto;
      animation: hudPulse 2s ease-in-out infinite;
    `;
    btn.addEventListener("pointerdown", () => {
      btn.style.transform = "scale(0.95)";
    });
    btn.addEventListener("pointerup", () => {
      btn.style.transform = "scale(1)";
      onStart();
    });
    overlay.appendChild(btn);

    // Instructions
    const instructions = document.createElement("div");
    instructions.textContent = "Tap / Click / Space to cycle color";
    instructions.style.cssText = `
      margin-top: 20px; font-size: 14px; color: rgba(255,255,255,0.4);
    `;
    overlay.appendChild(instructions);

    hud.appendChild(overlay);
  }

  /** Show game over screen */
  showGameOver(score: number, highScore: number, isHighScore: boolean, onRestart: () => void): void {
    const hud = this.container;
    if (!hud) return;
    hud.innerHTML = "";

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      pointer-events: auto;
      background: radial-gradient(ellipse at center, rgba(10,10,46,0.75) 0%, rgba(5,5,20,0.92) 100%);
      animation: hudFadeIn 0.3s ease-out;
    `;

    // Inject animation keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes hudFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      @keyframes hudPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    `;
    overlay.appendChild(style);

    const gameOverText = document.createElement("div");
    gameOverText.textContent = "GAME OVER";
    gameOverText.style.cssText = `
      font-size: 24px; color: rgba(255,255,255,0.5); font-weight: 600;
      margin-bottom: 8px; letter-spacing: 3px;
    `;
    overlay.appendChild(gameOverText);

    const scoreText = document.createElement("div");
    scoreText.textContent = score.toString();
    scoreText.style.cssText = `
      font-size: 72px; font-weight: 900; color: #fff;
      margin-bottom: 8px;
      text-shadow: 0 0 30px rgba(255,255,255,0.2);
    `;
    overlay.appendChild(scoreText);

    const hsText = document.createElement("div");
    hsText.textContent = `Best: ${highScore}`;
    hsText.style.cssText = `
      font-size: 20px; color: #FFD60A; font-weight: 700;
      margin-bottom: 8px;
    `;
    overlay.appendChild(hsText);

    if (isHighScore) {
      const newBest = document.createElement("div");
      newBest.textContent = "NEW BEST!";
      newBest.style.cssText = `
        font-size: 18px; color: #FFD60A; font-weight: 700;
        margin-bottom: 12px;
        animation: hudPulse 1s ease-in-out infinite;
        text-shadow: 0 0 15px rgba(255,214,10,0.6);
      `;
      overlay.appendChild(newBest);
    }

    const restartBtn = document.createElement("button");
    restartBtn.id = "hud-restart-btn";
    restartBtn.textContent = "PLAY AGAIN";
    restartBtn.style.cssText = `
      padding: 16px 52px; font-size: 20px; font-weight: 700;
      color: #fff; background: linear-gradient(135deg, #FF3B3B, #FF9F1C);
      border: none; border-radius: 12px; cursor: pointer;
      box-shadow: 0 4px 20px rgba(255,59,59,0.4);
      transition: transform 0.15s ease;
      pointer-events: auto; margin-top: 12px;
    `;
    restartBtn.addEventListener("pointerdown", () => {
      restartBtn.style.transform = "scale(0.95)";
    });
    restartBtn.addEventListener("pointerup", () => {
      restartBtn.style.transform = "scale(1)";
      onRestart();
    });
    overlay.appendChild(restartBtn);

    hud.appendChild(overlay);
  }

  clearHUD(): void {
    const hud = this.container;
    if (hud) hud.innerHTML = "";
  }
}
