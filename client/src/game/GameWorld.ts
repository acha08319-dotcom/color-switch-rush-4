// GameWorld.ts — Main orchestration for Color Switch Rush
// SCROLLING approach: ball stays at fixed Y, gates move DOWN toward it.
// Camera is static. This ensures gates are always visible and collisions are reliable.
//
// FEATURES: AudioManager for sound effects, warning cue before gate arrival,
// color cycle sound, pass/crash/combo sounds, screen shake on crash,
// tutorial overlay on first launch, daily challenge mode with seeded RNG.

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { PlayerBall } from "./PlayerBall";
import { GateManager } from "./GateManager";
import { CollisionDetector } from "./CollisionDetector";
import { ScoreManager } from "./ScoreManager";
import { ParticleManager } from "./ParticleManager";
import { UIController } from "./UIController";
import { InputManager } from "./InputManager";
import { AudioManager } from "./AudioManager";
import { ScreenShake } from "./ScreenShake";
import { DailyChallenge } from "./DailyChallenge";
import { SeededRandom } from "./SeededRandom";
import { YtGameAdapter } from "./YtGameAdapter";
import { readLocal, writeLocal } from "./StorageAdapter";

const TUTORIAL_KEY = "colorSwitchRush_tutorialSeen";

export class GameWorld {
  private scene: Scene;
  private camera: UniversalCamera;
  private ball: PlayerBall | null = null;
  private gateManager: GateManager | null = null;
  private collisionDetector: CollisionDetector;
  private scoreManager: ScoreManager;
  private particleManager: ParticleManager | null = null;
  private uiController: UIController;
  private inputManager: InputManager;
  private audioManager: AudioManager;
  private screenShake: ScreenShake;
  private dailyChallenge: DailyChallenge;
  private engine: Engine;
  private canvas: HTMLCanvasElement;

  // Game state
  private isPlaying = false;
  private isGameOver = false;
  private fallSpeed: number = 5;
  public ballY: number = 0;

  // Mode: "normal" or "daily"
  private gameMode: "normal" | "daily" = "normal";
  private isPaused = false;

  // Warning cue tracking
  private warnedGates = new WeakSet();
  private warningDistance: number = 5;

  constructor(
    engine: Engine,
    scene: Scene,
    camera: UniversalCamera,
    canvas: HTMLCanvasElement
  ) {
    this.engine = engine;
    this.scene = scene;
    this.camera = camera;
    this.canvas = canvas;

    this.collisionDetector = new CollisionDetector();
    this.scoreManager = new ScoreManager();
    this.uiController = new UIController();
    this.audioManager = new AudioManager();
    this.screenShake = new ScreenShake(camera);
    this.dailyChallenge = new DailyChallenge();
    this.inputManager = null as any;
  }

  mount(): void {
    this.uiController.mount(this.canvas);
  }

  showLoading(): void {
    this.uiController.showLoading();
  }

  async preparePersistence(): Promise<void> {
    await Promise.all([
      this.scoreManager.loadFromPlayables(),
      this.dailyChallenge.loadFromPlayables(),
    ]);
  }

  setAudioEnabled(enabled: boolean): void {
    this.audioManager.setMuted(!enabled);
  }

  pause(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    if (this.inputManager) this.inputManager.detach();
    void this.dailyChallenge.loadFromPlayables();
    this.scoreManager.saveHighScore();
  }

  resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    if (this.isPlaying && !this.isGameOver) {
      this.inputManager.attach(this.engine, this.canvas);
    }
  }

  /** Initialize and show the menu (or tutorial on first launch) */
  init(): void {
    this.camera.position = new Vector3(0, 3, -8);
    this.camera.setTarget(new Vector3(0, 0, 0));

    const tutorialSeen = readLocal(TUTORIAL_KEY);
    if (!tutorialSeen) {
      // First launch — show tutorial first, then menu
      this.uiController.showTutorial(() => {
        writeLocal(TUTORIAL_KEY, "true");
        this.showMainMenu();
      });
    } else {
      this.showMainMenu();
    }
  }

  /** Show the main menu with optional daily challenge button */
  private showMainMenu(): void {
    const highScore = this.scoreManager.getHighScore();
    const dailyBest = this.dailyChallenge.getDailyBest();

    this.uiController.showMenu(highScore, dailyBest, () => {
      this.audioManager.init();
      this.gameMode = "normal";
      this.beginGame();
    });

    // Add Daily Challenge button to the menu
    setTimeout(() => {
      this.uiController.addDailyChallengeButton(() => {
        this.audioManager.init();
        this.gameMode = "daily";
        this.beginGame();
      });
    }, 50);
  }

  /** Begin actual gameplay */
  beginGame(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.isGameOver = false;

    // Clean up any previous game state
    if (this.ball) this.ball.dispose();
    if (this.gateManager) this.gateManager.dispose();
    if (this.particleManager) this.particleManager.dispose();
    if (this.inputManager) this.inputManager.detach();
    this.collisionDetector.reset();
    this.warnedGates = new WeakSet();

    // Reset score
    this.scoreManager.reset();

    // Ball at fixed center position (Y=0)
    this.ballY = 0;
    this.ball = new PlayerBall(this.engine, this.scene, this.ballY);

    // Gates: use seeded RNG for daily mode, normal Math.random for regular
    const startSpawnY = this.ballY + 12;
    if (this.gameMode === "daily") {
      const rng = this.dailyChallenge.getRNG();
      this.gateManager = new GateManager(this.scene, startSpawnY, rng);
    } else {
      this.gateManager = new GateManager(this.scene, startSpawnY);
    }

    // Particles
    this.particleManager = new ParticleManager(this.scene);

    // Input: tap/click/spacebar cycles ball color with sound
    this.inputManager = new InputManager(() => this.cycleColor());
    this.inputManager.attach(this.engine, this.canvas);

    // Clear HUD and show gameplay overlay
    this.uiController.clearHUD();
    this.uiController.showGameOverlay();

    // Show mode indicator if daily
    if (this.gameMode === "daily") {
      this.showDailyModeIndicator();
    }

    // Stop demo mode
    if ((window as any).__stopDemo) {
      (window as any).__stopDemo();
    }
  }

  /** Show a small indicator during gameplay that we're in daily mode */
  private showDailyModeIndicator(): void {
    const hud = (this.uiController as any).container as HTMLElement;
    if (!hud) return;

    const indicator = document.createElement("div");
    indicator.id = "daily-mode-indicator";
    indicator.textContent = "DAILY CHALLENGE";
    indicator.style.cssText = `
      position: absolute; top: 24px; left: 24px;
      font-size: 12px; font-weight: 700; color: #FF9F1C;
      letter-spacing: 2px; padding: 6px 12px;
      background: rgba(255,159,28,0.12); border-radius: 8px;
      border: 1px solid rgba(255,159,28,0.3);
    `;
    hud.appendChild(indicator);
  }

  /** Update game loop (called every frame) */
  update(delta: number): void {
    // Keep the impact animation running for its full duration after a crash.
    this.screenShake.update(delta);
    if (!this.isPlaying || this.isPaused) return;

    // Scroll speed starts slow and increases with each gate passed
    const score = this.scoreManager.getScore();
    this.fallSpeed = 3 + score * 0.25;

    // STEP 1: Record gate Y positions BEFORE scrolling
    if (this.gateManager) {
      const gates = this.gateManager.getGates();
      for (const gate of gates) {
        this.collisionDetector.recordGateY(gate);
      }
    }

    // STEP 1.5: Check for warning cues
    if (this.gateManager) {
      const gates = this.gateManager.getGates();
      for (const gate of gates) {
        const gateY = gate.baseY;
        const approachThreshold = this.warningDistance;
        if (gateY > 0 && gateY <= approachThreshold && !this.warnedGates.has(gate)) {
          this.warnedGates.add(gate);
          this.uiController.showWarningFlash();
          this.audioManager.playWarning();
          break;
        }
      }
    }

    // STEP 2: Scroll gates downward
    if (this.gateManager) {
      this.gateManager.update(delta, this.fallSpeed);
    }

    // Ball stays fixed at Y=0
    if (this.ball) {
      this.ball.mesh.position.y = this.ballY;
    }

    // STEP 3: Check collisions
    if (this.ball && this.gateManager) {
      const gates = this.gateManager.getGates();
      for (const gate of gates) {
        const result = this.collisionDetector.checkForCrash(
          this.ball,
          gate,
          this.ballY
        );

        if (result === "pass") {
          this.scoreManager.pass();
          const multiplier = this.scoreManager.getMultiplier();
          const combo = this.scoreManager.getCombo();

          this.particleManager!.emitPassGlow(
            this.ballY,
            this.ball.getCurrentColorIndex() as 0 | 1 | 2 | 3 | 4 | 5
          );
          this.uiController.updateScore(
            this.scoreManager.getScore(),
            multiplier
          );

          this.audioManager.playPass(multiplier);
          if (combo >= 3) {
            setTimeout(() => {
              if (this.isPlaying) this.audioManager.playComboRise(combo);
            }, 80);
          }

          this.gateManager.setRotationSpeed(0.3);
          break;
        }

        if (result === "crash") {
          this.isGameOver = true;
          this.isPlaying = false;
          this.particleManager!.emitCrashBurst(
            this.ballY,
            this.ball.getCurrentColorIndex() as 0 | 1 | 2 | 3 | 4 | 5
          );
          this.scoreManager.saveHighScore();

          // Daily challenge: update daily best
          const finalScore = this.scoreManager.getScore();
          let isDailyBest = false;
          if (this.gameMode === "daily") {
            isDailyBest = this.dailyChallenge.updateDailyBest(finalScore);
          }

          this.audioManager.playCrash();
          // Trigger screen shake for intense crash impact
          this.screenShake.trigger(0.4, 0.45);

          this.uiController.showGameOver(
            this.scoreManager.getScore(),
            this.scoreManager.getCombo(),
            this.scoreManager.getHighScore(),
            this.scoreManager.getScore() >= this.scoreManager.getHighScore(),
            () => { void this.restartWithInterstitial(); },
            () => this.continueAfterReward()
          );

          // Show daily best info if in daily mode
          if (this.gameMode === "daily") {
            this.uiController.updateGameOverForDaily(
              finalScore,
              this.scoreManager.getCombo(),
              this.dailyChallenge.getDailyBest(),
              isDailyBest
            );
          }
          break;
        }
      }
    }

    // Update particles
    if (this.particleManager) {
      this.particleManager.update(delta);
    }

  }

  /** Cycle ball color */
  private cycleColor(): void {
    if (this.isPlaying && this.ball && !this.isGameOver) {
      this.ball.cycleColor();
      this.audioManager.playColorCycle();
    }
  }

  private async restartWithInterstitial(): Promise<void> {
    await YtGameAdapter.requestInterstitialAd();
    this.restart();
  }

  private async continueAfterReward(): Promise<boolean> {
    const earned = await YtGameAdapter.requestRewardedAd("color-switch-rush-extra-gates");
    if (!earned || !this.gateManager || !this.ball) return false;

    this.isGameOver = false;
    this.isPlaying = true;
    this.isPaused = false;
    this.collisionDetector.reset();
    this.warnedGates = new WeakSet();
    this.gateManager.prepareContinuation(3, this.ballY);
    this.inputManager.attach(this.engine, this.canvas);
    this.uiController.clearHUD();
    this.uiController.showGameOverlay();
    if (this.gameMode === "daily") this.showDailyModeIndicator();
    return true;
  }

  /** Restart after game over */
  private restart(): void {
    this.isPlaying = false;
    this.isGameOver = false;
    this.isPaused = false;

    if (this.inputManager) this.inputManager.detach();
    if (this.ball) { this.ball.dispose(); this.ball = null; }
    if (this.gateManager) { this.gateManager.dispose(); this.gateManager = null; }
    if (this.particleManager) { this.particleManager.dispose(); this.particleManager = null; }
    this.collisionDetector.reset();
    this.warnedGates = new WeakSet();

    // Reposition camera for menu
    this.camera.position = new Vector3(0, 3, -8);
    this.camera.setTarget(new Vector3(0, 0, 0));

    // Restart demo mode for the menu
    if ((window as any).__startDemo) {
      (window as any).__startDemo();
    }

    this.showMainMenu();
  }

  /** Stop the game world */
  stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    if (this.inputManager) this.inputManager.detach();
    this.uiController.dispose();
    this.audioManager.dispose();
  }
}
