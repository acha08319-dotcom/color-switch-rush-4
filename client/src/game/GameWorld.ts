// GameWorld.ts — Main orchestration for Color Switch Rush
// SCROLLING approach: ball stays at fixed Y, gates move DOWN toward it.
// Camera is static. This ensures gates are always visible and collisions are reliable.
//
// NEW FEATURES: AudioManager for sound effects, warning cue before gate arrival,
// color cycle sound, pass/crash/combo sounds.

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
  private engine: Engine;
  private canvas: HTMLCanvasElement;

  // Game state
  private isPlaying = false;
  private isGameOver = false;
  private fallSpeed: number = 5; // speed gates scroll down
  public ballY: number = 0; // fixed position for the ball

  // Warning cue tracking
  private warnedGates = new WeakSet();
  private warningDistance: number = 5; // trigger warning when gate is this many units from ball
  private lastColorCycled = false; // track color changes for sound debounce

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
    this.inputManager = null as any;
  }

  mount(): void {
    this.uiController.mount(this.canvas);
  }

  /** Initialize and show the menu */
  init(): void {
    this.camera.position = new Vector3(0, 3, -8);
    this.camera.setTarget(new Vector3(0, 0, 0));

    this.uiController.showMenu(this.scoreManager.getHighScore(), () => {
      this.audioManager.init(); // Initialize audio on first user gesture
      this.beginGame();
    });
  }

  /** Begin actual gameplay after menu */
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

    // Gates spawn above the ball and scroll down
    this.gateManager = new GateManager(this.scene, this.ballY + 12);

    // Particles
    this.particleManager = new ParticleManager(this.scene);

    // Input: tap/click/spacebar cycles ball color with sound
    this.inputManager = new InputManager(() => this.cycleColor());
    this.inputManager.attach(this.engine, this.canvas);

    // Clear HUD and show gameplay overlay
    this.uiController.clearHUD();
    this.uiController.showGameOverlay();

    // Stop demo mode
    if ((window as any).__stopDemo) {
      (window as any).__stopDemo();
    }
  }

  /** Update game loop (called every frame) */
  update(delta: number): void {
    if (!this.isPlaying) return;

    // Scroll speed starts slow and increases with each gate passed
    const score = this.scoreManager.getScore();
    this.fallSpeed = 3 + score * 0.25;

    // STEP 1: Record gate Y positions BEFORE scrolling (for crossing detection)
    if (this.gateManager) {
      const gates = this.gateManager.getGates();
      for (const gate of gates) {
        this.collisionDetector.recordGateY(gate);
      }
    }

    // STEP 1.5: Check for warning cues — gates approaching within warning distance
    if (this.gateManager) {
      const gates = this.gateManager.getGates();
      for (const gate of gates) {
        const gateY = gate.baseY;
        // Warning when gate is between warningDistance and warningDistance + fallSpeed * delta
        // (i.e., gate will cross ballY within ~1 second)
        const approachThreshold = this.warningDistance;
        if (gateY > 0 && gateY <= approachThreshold && !this.warnedGates.has(gate)) {
          this.warnedGates.add(gate);
          this.uiController.showWarningFlash();
          this.audioManager.playWarning();
          break; // Only warn once per frame
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

    // STEP 3: Check collisions — detect gates that crossed ballY this frame
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

          // Sound: pass ping + combo rise if combo is building
          this.audioManager.playPass(multiplier);
          if (combo >= 3) {
            // Delayed combo rise sound for build-up feel
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
          this.audioManager.playCrash();
          this.uiController.showGameOver(
            this.scoreManager.getScore(),
            this.scoreManager.getCombo(),
            this.scoreManager.getHighScore(),
            this.scoreManager.getScore() >= this.scoreManager.getHighScore(),
            () => this.restart()
          );
          break;
        }
      }
    }

    // Update particles
    if (this.particleManager) {
      this.particleManager.update(delta);
    }
  }

  /** Cycle ball color (called on tap/click/spacebar) */
  private cycleColor(): void {
    if (this.isPlaying && this.ball && !this.isGameOver) {
      this.ball.cycleColor();
      this.audioManager.playColorCycle();
    }
  }

  /** Restart after game over */
  private restart(): void {
    this.isPlaying = false;
    this.isGameOver = false;

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

    this.uiController.showMenu(this.scoreManager.getHighScore(), () => {
      this.beginGame();
    });
  }

  /** Stop the game world */
  stop(): void {
    this.isPlaying = false;
    if (this.inputManager) this.inputManager.detach();
    this.uiController.dispose();
    this.audioManager.dispose();
  }
}
