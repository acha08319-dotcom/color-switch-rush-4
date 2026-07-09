// GameWorld.ts — Main orchestration for Color Switch Rush
// SCROLLING approach: ball stays at fixed Y, gates move DOWN toward it.
// Camera is static. This ensures gates are always visible and collisions are reliable.

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
  private engine: Engine;
  private canvas: HTMLCanvasElement;

  // Game state
  private isPlaying = false;
  private isGameOver = false;
  private fallSpeed: number = 5; // speed gates scroll down
  public ballY: number = 0; // fixed position for the ball

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
    this.inputManager = null as any;
  }

  mount(): void {
    this.uiController.mount(this.canvas);
  }

  /** Initialize and show the menu */
  init(): void {
    // Camera positioned to show ball at center-bottom and gates above
    // At Z=-8, FOV=1.3: visible range is ~12 units vertically centered on target
    this.camera.position = new Vector3(0, 3, -8);
    this.camera.setTarget(new Vector3(0, 0, 0));

    this.uiController.showMenu(this.scoreManager.getHighScore(), () => {
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

    // Reset score
    this.scoreManager.reset();

    // Ball at fixed center position (Y=0)
    this.ballY = 0;
    this.ball = new PlayerBall(this.engine, this.scene, this.ballY);

    // Gates spawn above the ball and scroll down
    // First gate at Y=12 gives player ~4 seconds at speed 3 to prepare
    this.gateManager = new GateManager(this.scene, this.ballY + 12);

    // Particles
    this.particleManager = new ParticleManager(this.scene);

    // Input: tap/click/spacebar cycles ball color
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
          this.particleManager!.emitPassGlow(
            this.ballY,
            this.ball.getCurrentColorIndex() as 0 | 1 | 2 | 3 | 4 | 5
          );
          this.uiController.updateScore(
            this.scoreManager.getScore(),
            this.scoreManager.getMultiplier()
          );
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
          this.uiController.showGameOver(
            this.scoreManager.getScore(),
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
  }
}
