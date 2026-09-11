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
      font-family: 'Arial Narrow', 'Segoe UI', system-ui, sans-serif;
      user-select: none; overflow: hidden; isolation: isolate;
      --safe-top: env(safe-area-inset-top, 0px);
      --safe-right: env(safe-area-inset-right, 0px);
      --safe-bottom: env(safe-area-inset-bottom, 0px);
      --safe-left: env(safe-area-inset-left, 0px);
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

  showLoading(): void {
    const hud = this.container;
    if (!hud) return;
    hud.innerHTML = "";

    const loading = document.createElement("div");
    loading.id = "hud-loading";
    loading.textContent = "LOADING";
    loading.style.cssText = `
      position: absolute; inset: 0; display: flex;
      align-items: center; justify-content: center;
      color: rgba(255,255,255,0.72); font-size: 16px; font-weight: 700;
      letter-spacing: 4px; background: #050514;
    `;
    hud.appendChild(loading);
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
      position: absolute; top: calc(var(--safe-top) + 18px); right: calc(var(--safe-right) + 22px);
      font-size: clamp(36px, 8vw, 52px); font-weight: 900; color: #fff;
      text-shadow: 0 0 20px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.5);
    `;
    scoreEl.textContent = "0";
    hud.appendChild(scoreEl);

    // Multiplier + combo (top-center)
    const multEl = document.createElement("div");
    multEl.id = "hud-multiplier";
    multEl.style.cssText = `
      position: absolute; top: calc(var(--safe-top) + 16px); left: 50%;
      transform: translateX(-50%);
      font-size: clamp(24px, 5vw, 30px); font-weight: 900;
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
      position: absolute; top: calc(var(--safe-top) + 56px); left: 50%;
      transform: translateX(-50%);
      font-size: 14px; font-weight: 700;
      color: rgba(255,214,10,0.74);
      letter-spacing: 2px;
    `;
    comboEl.textContent = "COMBO 0";
    hud.appendChild(comboEl);

    const rushWrap = document.createElement("div");
    rushWrap.id = "hud-rush-wrap";
    rushWrap.style.cssText = `
      position: absolute; top: calc(var(--safe-top) + 92px); left: 50%;
      width: min(180px, 46vw); height: 5px; transform: translateX(-50%);
      border: 1px solid rgba(22,217,255,0.38); background: rgba(4,16,40,0.72);
      overflow: hidden; opacity: 0.82;
    `;
    const rushFill = document.createElement("div");
    rushFill.id = "hud-rush-fill";
    rushFill.style.cssText = `height: 100%; width: 0%; background: #16D9FF; box-shadow: 0 0 14px #16D9FF; transition: width 160ms cubic-bezier(0.23,1,0.32,1), background 160ms ease;`;
    rushWrap.appendChild(rushFill);
    hud.appendChild(rushWrap);

    const rushLabel = document.createElement("div");
    rushLabel.id = "hud-rush-label";
    rushLabel.textContent = "RUSH CHARGE";
    rushLabel.style.cssText = `
      position: absolute; top: calc(var(--safe-top) + 101px); left: 50%;
      transform: translateX(-50%); font-size: 9px; font-weight: 800;
      letter-spacing: 2px; color: rgba(22,217,255,0.66);
    `;
    hud.appendChild(rushLabel);

    const rail = document.createElement("div");
    rail.id = "hud-upcoming-rail";
    rail.style.cssText = `
      position: absolute; left: calc(var(--safe-left) + 20px); bottom: calc(var(--safe-bottom) + 24px);
      display: flex; flex-direction: column; gap: 7px; align-items: center;
      padding: 10px 8px; background: rgba(4,10,30,0.56); border: 1px solid rgba(255,255,255,0.13);
      backdrop-filter: blur(8px); pointer-events: none;
    `;
    const railLabel = document.createElement("div");
    railLabel.textContent = "NEXT";
    railLabel.style.cssText = "font-size: 9px; font-weight: 800; letter-spacing: 2px; color: rgba(255,255,255,0.48);";
    rail.appendChild(railLabel);
    const railDots = document.createElement("div");
    railDots.id = "hud-upcoming-dots";
    railDots.style.cssText = "display: flex; gap: 6px; align-items: center;";
    rail.appendChild(railDots);
    hud.appendChild(rail);
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
      if (multiplier >= 5) {
        multEl.style.fontSize = "40px";
        multEl.style.color = "#FF6B6B";
        multEl.style.textShadow = "0 0 40px rgba(255,107,107,0.9), 0 2px 4px rgba(0,0,0,0.5)";
      } else if (multiplier >= 3) {
        multEl.style.fontSize = "36px";
        multEl.style.color = "#FFA500";
        multEl.style.textShadow = "0 0 30px rgba(255,165,0,0.9), 0 2px 4px rgba(0,0,0,0.5)";
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

  /** Show the start menu (with optional daily best display) */
  showMenu(
    highScore: number,
    dailyBest: number | undefined,
    onStart: () => void,
    hapticsEnabled = false,
    onToggleHaptics: () => boolean = () => hapticsEnabled,
  ): void {
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

    // Daily best display
    if (dailyBest !== undefined && dailyBest > 0) {
      const db = document.createElement("div");
      db.textContent = `Daily Best: ${dailyBest}`;
      db.style.cssText = `
        font-size: 14px; color: #FF9F1C; font-weight: 600;
        margin-bottom: 8px;
      `;
      overlay.appendChild(db);
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

    const hapticsBtn = document.createElement("button");
    hapticsBtn.id = "hud-haptics-btn";
    hapticsBtn.textContent = `VIBRATION ${hapticsEnabled ? "ON" : "OFF"}`;
    hapticsBtn.style.cssText = `
      margin-top: 18px; padding: 8px 14px; font-size: 10px; font-weight: 800;
      letter-spacing: 1.5px; color: rgba(255,255,255,0.64); background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.16); cursor: pointer; pointer-events: auto;
    `;
    hapticsBtn.addEventListener("click", () => {
      const next = onToggleHaptics();
      hapticsBtn.textContent = `VIBRATION ${next ? "ON" : "OFF"}`;
      hapticsBtn.style.color = next ? "#16D9FF" : "rgba(255,255,255,0.64)";
      hapticsBtn.style.borderColor = next ? "rgba(22,217,255,0.58)" : "rgba(255,255,255,0.16)";
    });
    overlay.appendChild(hapticsBtn);

    // Instructions
    const instructions = document.createElement("div");
    instructions.textContent = "Tap / Click / Space to cycle color";
    instructions.style.cssText = `
      margin-top: 20px; font-size: 14px; color: rgba(255,255,255,0.4);
    `;
    overlay.appendChild(instructions);

    hud.appendChild(overlay);
  }

  /** Show a brief warning flash overlay before a gate arrives */
  showWarningFlash(): void {
    const hud = this.container;
    if (!hud) return;

    // Remove any existing warning
    const existing = hud.querySelector("#warning-flash");
    if (existing) existing.remove();

    const flash = document.createElement("div");
    flash.id = "warning-flash";
    flash.style.cssText = `
      position: absolute; inset: 0;
      background: rgba(255, 59, 59, 0.08);
      pointer-events: none;
      z-index: 50;
      animation: warningPulse 0.5s ease-out forwards;
    `;

    // Inject keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes warningPulse {
        0% { background: rgba(255, 59, 59, 0.12); }
        50% { background: rgba(255, 59, 59, 0.06); }
        100% { background: rgba(255, 59, 59, 0); }
      }
    `;
    flash.appendChild(style);
    hud.appendChild(flash);

    // Also add a "GET READY" text at the bottom
    const readyText = document.createElement("div");
    readyText.textContent = "GET READY";
    readyText.style.cssText = `
      position: absolute; bottom: 80px; left: 50%;
      transform: translateX(-50%);
      font-size: 22px; font-weight: 700; color: #FF3B3B;
      letter-spacing: 3px;
      text-shadow: 0 0 20px rgba(255, 59, 59, 0.6);
      animation: warningTextFade 0.6s ease-out forwards;
    `;

    const textStyle = document.createElement("style");
    textStyle.textContent = `
      @keyframes warningTextFade {
        0% { opacity: 1; transform: translateX(-50%) scale(1.1); }
        70% { opacity: 1; }
        100% { opacity: 0; transform: translateX(-50%) scale(0.9); }
      }
    `;
    readyText.appendChild(textStyle);
    flash.appendChild(readyText);

    // Auto-remove after animation
    setTimeout(() => {
      const el = hud.querySelector("#warning-flash");
      if (el) el.remove();
    }, 600);
  }

  /** Show game over screen */
  showGameOver(
    score: number,
    combo: number,
    highScore: number,
    isHighScore: boolean,
    onRestart: () => void,
    allowShare = true,
  ): void {
    const hud = this.container;
    if (!hud) return;
    hud.innerHTML = "";

    const overlay = document.createElement("div");
    overlay.id = "hud-gameover-overlay";
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

    // Combo display
    const comboText = document.createElement("div");
    comboText.textContent = `${combo}x Combo`;
    comboText.style.cssText = `
      font-size: 22px; color: #FFD60A; font-weight: 700;
      margin-bottom: 4px;
      text-shadow: 0 0 12px rgba(255,214,10,0.4);
    `;
    overlay.appendChild(comboText);

    const hsText = document.createElement("div");
    hsText.textContent = `Best: ${highScore}`;
    hsText.style.cssText = `
      font-size: 20px; color: rgba(255,255,255,0.5); font-weight: 600;
      margin-bottom: 16px;
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

    // Buttons row
    const btnRow = document.createElement("div");
    btnRow.id = "hud-gameover-buttons";
    btnRow.style.cssText = `
      display: flex; gap: 12px; margin-top: 16px;
      align-items: center;
    `;

    // Local-preview convenience only. Playables mode must not show in-game sharing prompts.
    const shareBtn = document.createElement("button");
    shareBtn.id = "hud-share-btn";
    shareBtn.textContent = "SHARE SCORE";
    shareBtn.style.cssText = `
      padding: 14px 28px; font-size: 16px; font-weight: 700;
      color: #fff; background: linear-gradient(135deg, #2EC4B6, #00B4D8);
      border: none; border-radius: 12px; cursor: pointer;
      box-shadow: 0 4px 20px rgba(46,196,182,0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      pointer-events: auto;
    `;
    shareBtn.addEventListener("pointerdown", () => {
      shareBtn.style.transform = "scale(0.95)";
    });
    shareBtn.addEventListener("click", () => {
      shareBtn.style.transform = "scale(1)";
      // Copy score to clipboard
      const shareText = `I scored ${score} with a ${combo}x combo in Color Switch Rush! Can you beat my best of ${highScore}?`;

      const showCopied = () => {
        shareBtn.textContent = "COPIED!";
        shareBtn.style.background = "linear-gradient(135deg, #FFD60A, #FF9F1C)";
        setTimeout(() => {
          shareBtn.textContent = "SHARE SCORE";
          shareBtn.style.background = "linear-gradient(135deg, #2EC4B6, #00B4D8)";
        }, 1500);
      };

      // Try clipboard API first, fallback to execCommand
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(showCopied).catch(() => {
          // Fallback
          const ta = document.createElement("textarea");
          ta.value = shareText;
          ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e) { /* ignore */ }
          document.body.removeChild(ta);
          showCopied();
        });
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareText;
        ta.style.cssText = "position:fixed;left:-9999px;top:-9999px";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
        showCopied();
      }
    });
    if (allowShare) btnRow.appendChild(shareBtn);

    // Play Again button
    const restartBtn = document.createElement("button");
    restartBtn.id = "hud-restart-btn";
    restartBtn.textContent = "PLAY AGAIN";
    restartBtn.style.cssText = `
      padding: 14px 28px; font-size: 16px; font-weight: 700;
      color: #fff; background: linear-gradient(135deg, #FF3B3B, #FF9F1C);
      border: none; border-radius: 12px; cursor: pointer;
      box-shadow: 0 4px 20px rgba(255,59,59,0.4);
      transition: transform 0.15s ease;
      pointer-events: auto;
    `;
    restartBtn.addEventListener("pointerdown", () => {
      restartBtn.style.transform = "scale(0.95)";
    });
    restartBtn.addEventListener("pointerup", () => {
      restartBtn.style.transform = "scale(1)";
      onRestart();
    });
    btnRow.appendChild(restartBtn);

    overlay.appendChild(btnRow);
    hud.appendChild(overlay);
  }

  /** Show tutorial overlay on first launch */
  showTutorial(onDismiss: () => void): void {
    const hud = this.container;
    if (!hud) return;
    hud.innerHTML = "";

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      pointer-events: auto; padding: 40px;
      background: radial-gradient(ellipse at center, rgba(10,10,46,0.85) 0%, rgba(5,5,20,0.95) 100%);
      animation: hudFadeIn 0.4s ease-out;
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes hudFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes floatUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    `;
    overlay.appendChild(style);

    // Title
    const title = document.createElement("h1");
    title.textContent = "HOW TO PLAY";
    title.style.cssText = `
      font-size: 42px; font-weight: 900; color: #fff;
      margin: 0 0 8px 0; letter-spacing: 2px;
      text-shadow: 0 0 30px rgba(155,93,229,0.5);
    `;
    overlay.appendChild(title);

    const subtitle = document.createElement("div");
    subtitle.textContent = "Match the colors. Survive the rush.";
    subtitle.style.cssText = `
      font-size: 16px; color: rgba(255,255,255,0.5);
      margin-bottom: 36px; letter-spacing: 1px;
    `;
    overlay.appendChild(subtitle);

    // Tutorial steps
    const steps = [
      { icon: "\u25CF", label: "YOUR BALL", desc: "Cycles through 6 colors. Tap or press Space to switch." },
      { icon: "\u25CB", label: "COLOR GATES", desc: "Rotating rings with 6 colored segments. You must match!" },
      { icon: "\u2713", label: "MATCH = SCORE", desc: "Pass through matching colors. Mismatch = game over!" },
    ];

    steps.forEach((step, i) => {
      const stepEl = document.createElement("div");
      stepEl.style.cssText = `
        display: flex; align-items: flex-start; gap: 16px;
        width: 100%; max-width: 440px; padding: 14px 20px;
        background: rgba(255,255,255,0.04); border-radius: 12px;
        margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.08);
        animation: floatUp 0.4s ease-out ${0.15 + i * 0.1}s both;
      `;

      const icon = document.createElement("div");
      icon.textContent = step.icon;
      icon.style.cssText = `
        font-size: 24px; color: #9B5DE5; flex-shrink: 0;
        text-shadow: 0 0 10px rgba(155,93,229,0.4);
      `;
      stepEl.appendChild(icon);

      const textWrap = document.createElement("div");
      const label = document.createElement("div");
      label.textContent = step.label;
      label.style.cssText = `
        font-size: 14px; font-weight: 700; color: #9B5DE5;
        margin-bottom: 2px; letter-spacing: 1px;
      `;
      textWrap.appendChild(label);

      const desc = document.createElement("div");
      desc.textContent = step.desc;
      desc.style.cssText = `
        font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.4;
      `;
      textWrap.appendChild(desc);

      stepEl.appendChild(textWrap);
      overlay.appendChild(stepEl);
    });

    // Color demo
    const demoDiv = document.createElement("div");
    demoDiv.style.cssText = `
      display: flex; align-items: center; gap: 8px;
      margin-top: 20px; padding: 12px 20px;
      background: rgba(155,93,229,0.08); border-radius: 10px;
      border: 1px solid rgba(155,93,229,0.2);
    `;

    // Small color dots
    for (const c of COLORS_HEX) {
      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 14px; height: 14px; border-radius: 50%;
        background: ${c}; box-shadow: 0 0 8px ${c}60;
      `;
      demoDiv.appendChild(dot);
    }

    const arrow = document.createElement("div");
    arrow.textContent = "\u2192";
    arrow.style.cssText = `
      font-size: 16px; color: rgba(255,255,255,0.3); margin-left: 4px;
    `;
    demoDiv.appendChild(arrow);

    const demoText = document.createElement("div");
    demoText.textContent = "Tap to cycle";
    demoText.style.cssText = `
      margin-left: 8px; font-size: 13px; color: rgba(255,255,255,0.4);
    `;
    demoDiv.appendChild(demoText);
    overlay.appendChild(demoDiv);

    // Combo tip
    const comboTip = document.createElement("div");
    comboTip.textContent = "Pro tip: Pass consecutive gates for a combo multiplier!";
    comboTip.style.cssText = `
      font-size: 13px; color: #FFD60A; margin-top: 20px; margin-bottom: 28px;
      text-shadow: 0 0 10px rgba(255,214,10,0.3);
    `;
    overlay.appendChild(comboTip);

    // Start button
    const btn = document.createElement("button");
    btn.textContent = "LET'S GO!";
    btn.style.cssText = `
      padding: 16px 64px; font-size: 20px; font-weight: 800;
      color: #fff; background: linear-gradient(135deg, #9B5DE5, #00B4D8);
      border: none; border-radius: 14px; cursor: pointer;
      box-shadow: 0 4px 24px rgba(155,93,229,0.5);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      letter-spacing: 1px;
    `;
    btn.addEventListener("pointerdown", () => {
      btn.style.transform = "scale(0.95)";
    });
    btn.addEventListener("pointerup", () => {
      btn.style.transform = "scale(1)";
      onDismiss();
    });
    overlay.appendChild(btn);

    hud.appendChild(overlay);
  }

  /** Add a "Daily Challenge" button to the menu */
  addDailyChallengeButton(onClick: () => void): void {
    const hud = this.container;
    if (!hud) return;

    // Find the menu overlay
    const menuOverlay = hud.querySelector('[style*="display: flex"]') as HTMLElement;
    if (!menuOverlay) return;

    // Check if button already exists
    if (menuOverlay.querySelector("#hud-daily-btn")) return;

    const btn = document.createElement("button");
    btn.id = "hud-daily-btn";
    btn.textContent = "DAILY CHALLENGE";
    btn.style.cssText = `
      padding: 12px 36px; font-size: 15px; font-weight: 700;
      color: #fff; background: linear-gradient(135deg, #FF3B3B, #FF9F1C);
      border: none; border-radius: 12px; cursor: pointer;
      box-shadow: 0 4px 20px rgba(255,59,59,0.3);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      pointer-events: auto; margin-top: 16px;
      letter-spacing: 1px;
    `;
    btn.addEventListener("pointerdown", () => {
      btn.style.transform = "scale(0.95)";
    });
    btn.addEventListener("pointerup", () => {
      btn.style.transform = "scale(1)";
      onClick();
    });
    menuOverlay.appendChild(btn);
  }

  /** Show daily challenge score on game over */
  updateGameOverForDaily(score: number, combo: number, dailyBest: number, isDailyBest: boolean): void {
    const hud = this.container;
    if (!hud) return;

    // Use stable IDs so the daily badge stays separate from the action buttons.
    const gameoverOverlay = hud.querySelector("#hud-gameover-overlay") as HTMLElement | null;
    if (!gameoverOverlay) return;

    const btnRow = gameoverOverlay.querySelector("#hud-gameover-buttons") as HTMLElement | null;
    const dailyEl = document.createElement("div");
    dailyEl.style.cssText = `
      font-size: 16px; color: #FF9F1C; font-weight: 700;
      margin-top: 12px; padding: 8px 20px;
      background: rgba(255,159,28,0.1); border-radius: 8px;
      border: 1px solid rgba(255,159,28,0.3);
    `;
    dailyEl.textContent = isDailyBest ? `NEW DAILY BEST!` : `Daily Best: ${dailyBest}`;

    if (btnRow) {
      gameoverOverlay.insertBefore(dailyEl, btnRow);
    } else {
      gameoverOverlay.appendChild(dailyEl);
    }
  }

  updateRushProgress(progress: number, threshold: number): void {
    const hud = this.container;
    if (!hud) return;
    const fill = hud.querySelector("#hud-rush-fill") as HTMLElement | null;
    const label = hud.querySelector("#hud-rush-label") as HTMLElement | null;
    if (!fill || !label) return;
    const ratio = threshold > 0 ? Math.max(0, Math.min(1, progress / threshold)) : 0;
    fill.style.width = `${ratio * 100}%`;
    const charged = ratio >= 1;
    fill.style.background = charged ? "#FFD60A" : "#16D9FF";
    fill.style.boxShadow = charged ? "0 0 16px #FFD60A" : "0 0 14px #16D9FF";
    label.textContent = charged ? "RUSH READY" : "RUSH CHARGE";
    label.style.color = charged ? "#FFD60A" : "rgba(22,217,255,0.66)";
  }

  updateUpcoming(colorIndices: number[]): void {
    const hud = this.container;
    if (!hud) return;
    const dots = hud.querySelector("#hud-upcoming-dots") as HTMLElement | null;
    if (!dots) return;
    dots.innerHTML = "";
    colorIndices.slice(0, 3).forEach((colorIndex, index) => {
      const dot = document.createElement("span");
      const color = COLORS_HEX[colorIndex] ?? "#ffffff";
      dot.setAttribute("aria-label", `Upcoming gate ${index + 1}`);
      dot.style.cssText = `
        display: block; width: ${index === 0 ? 16 : 11}px; height: ${index === 0 ? 16 : 11}px;
        border-radius: 50%; background: ${color}; opacity: ${index === 0 ? 1 : 0.58};
        box-shadow: 0 0 ${index === 0 ? 13 : 8}px ${color};
        border: ${index === 0 ? "2px solid rgba(255,255,255,0.85)" : "1px solid rgba(255,255,255,0.28)"};
      `;
      dots.appendChild(dot);
    });
  }

  showRushBurst(): void {
    const hud = this.container;
    if (!hud || hud.querySelector("#rush-burst")) return;
    const burst = document.createElement("div");
    burst.id = "rush-burst";
    burst.textContent = "RUSH";
    burst.style.cssText = `
      position: absolute; left: 50%; top: 42%; transform: translate(-50%, -50%) rotate(-5deg);
      color: #FFD60A; font-size: clamp(48px, 15vw, 92px); font-weight: 1000; font-style: italic;
      letter-spacing: -2px; text-shadow: 0 0 12px #16D9FF, 0 0 42px rgba(255,214,10,0.72);
      animation: rushBurst 760ms cubic-bezier(0.23,1,0.32,1) forwards; pointer-events: none;
    `;
    const style = document.createElement("style");
    style.textContent = `@keyframes rushBurst { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0.72) rotate(-10deg); } 20% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.2) rotate(3deg); } }`;
    burst.appendChild(style);
    hud.appendChild(burst);
    setTimeout(() => burst.remove(), 820);
  }

  showPauseOverlay(onResume: () => void = () => undefined, isPlayables = false): void {
    const hud = this.container;
    if (!hud || hud.querySelector("#pause-overlay")) return;
    const pause = document.createElement("div");
    pause.id = "pause-overlay";
    pause.style.cssText = `
      position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; background: rgba(3,7,24,0.68);
      backdrop-filter: blur(5px); pointer-events: none;
    `;
    const title = document.createElement("div");
    title.textContent = "PAUSED";
    title.style.cssText = "font-size: clamp(30px, 8vw, 52px); font-weight: 900; letter-spacing: 4px; color: #fff; text-shadow: 0 0 24px rgba(22,217,255,0.7);";
    pause.appendChild(title);
    const hint = document.createElement("div");
    hint.textContent = isPlayables ? "RESUME FROM YOUTUBE CONTROLS" : "PRESS ESC TO RESUME";
    hint.style.cssText = "margin-top: 12px; font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.56);";
    pause.appendChild(hint);
    if (!isPlayables) {
      const resume = document.createElement("button");
      resume.textContent = "RESUME";
      resume.style.cssText = "margin-top: 22px; padding: 11px 24px; color: #041020; background: #16D9FF; border: 0; font: 800 12px Arial, sans-serif; letter-spacing: 1.5px; cursor: pointer; pointer-events: auto; box-shadow: 0 0 22px rgba(22,217,255,0.45);";
      resume.addEventListener("click", onResume);
      pause.appendChild(resume);
    }
    hud.appendChild(pause);
  }

  hidePauseOverlay(): void {
    this.container?.querySelector("#pause-overlay")?.remove();
  }

  clearHUD(): void {
    const hud = this.container;
    if (hud) hud.innerHTML = "";
  }
}
