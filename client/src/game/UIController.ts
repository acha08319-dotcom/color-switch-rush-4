// UIController.ts — DOM-based HUD overlay for Color Switch Rush
// Score top-right, multiplier/combo top-center (gold glow), combo counter
// Game over screen with final score, multiplier, and replay button

import { COLORS } from "./types";
import { YtGameAdapter } from "./YtGameAdapter";

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

  /** Show the start menu (with optional daily best display) */
  showMenu(highScore: number, dailyBest: number | undefined, onStart: () => void): void {
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
    onRewardedContinue?: () => Promise<boolean>,
  ): void {
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
    btnRow.style.cssText = `
      display: flex; gap: 12px; margin-top: 16px;
      align-items: center;
    `;

    // Rewarded continuation is only surfaced inside the YouTube Playables host.
    if (onRewardedContinue && YtGameAdapter.isInPlayables()) {
      const rewardBtn = document.createElement("button");
      rewardBtn.id = "hud-reward-btn";
      rewardBtn.textContent = "WATCH AD TO CONTINUE";
      rewardBtn.style.cssText = `
        padding: 12px 20px; font-size: 12px; font-weight: 800;
        color: #111; background: #FFD60A; border: none; border-radius: 10px;
        cursor: pointer; box-shadow: 0 4px 18px rgba(255,214,10,0.3);
        transition: transform 0.15s ease, opacity 0.15s ease;
        pointer-events: auto; letter-spacing: 0.8px;
      `;
      rewardBtn.addEventListener("pointerdown", () => {
        rewardBtn.style.transform = "scale(0.95)";
      });
      rewardBtn.addEventListener("click", async () => {
        rewardBtn.style.transform = "scale(1)";
        rewardBtn.disabled = true;
        rewardBtn.style.opacity = "0.65";
        rewardBtn.textContent = "LOADING AD...";
        const earned = await onRewardedContinue();
        if (!earned && rewardBtn.isConnected) {
          rewardBtn.disabled = false;
          rewardBtn.style.opacity = "1";
          rewardBtn.textContent = "WATCH AD TO CONTINUE";
        }
      });
      overlay.appendChild(rewardBtn);
    }

    // Share Score button
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
    btnRow.appendChild(shareBtn);

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

    // Find the game-over overlay
    const overlays = hud.querySelectorAll('[style*="display: flex"]');
    const gameoverOverlay = overlays[overlays.length - 1] as HTMLElement;
    if (!gameoverOverlay) return;

    // Find the button row and insert before it
    const btnRow = gameoverOverlay.querySelector('[style*="gap"]') as HTMLElement;
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

  clearHUD(): void {
    const hud = this.container;
    if (hud) hud.innerHTML = "";
  }
}
