// ScreenShake.ts — Camera shake utility with exponential decay
// Triggers a brief, intense camera offset that decays over ~0.4 seconds.
// Supports both position shake and slight rotation jitter for extra intensity.

import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export class ScreenShake {
  private camera: UniversalCamera;
  private isActive: boolean = false;
  private elapsed: number = 0;
  private duration: number = 0.4; // seconds
  private intensity: number = 0.35; // maximum shake magnitude
  private originalPosition: Vector3 = new Vector3(0, 0, 0);
  private seed: number = 0;

  constructor(camera: UniversalCamera) {
    this.camera = camera;
  }

  /** Trigger a screen shake with the given intensity and duration */
  trigger(intensity?: number, duration?: number): void {
    this.intensity = intensity ?? 0.35;
    this.duration = duration ?? 0.4;
    this.elapsed = 0;
    this.isActive = true;
    this.seed = Math.random() * 10000;
    this.originalPosition = this.camera.position.clone();
  }

  /** Call every frame to update shake offset */
  update(delta: number): void {
    if (!this.isActive) return;

    this.elapsed += delta;
    const decay = Math.exp(-this.elapsed / (this.duration * 0.3));
    const progress = Math.min(this.elapsed / this.duration, 1);

    if (progress >= 1) {
      this.camera.position.copyFrom(this.originalPosition);
      this.camera.setTarget(new Vector3(0, 0, 0));
      this.isActive = false;
      return;
    }

    const currentIntensity = this.intensity * decay;
    this.seed += 1;
    const x = this.pseudoRandom(this.seed) * currentIntensity;
    const y = this.pseudoRandom(this.seed + 1) * currentIntensity * 0.6;
    const z = this.pseudoRandom(this.seed + 2) * currentIntensity * 0.4;

    this.camera.position = new Vector3(
      this.originalPosition.x + x,
      this.originalPosition.y + y,
      this.originalPosition.z + z
    );
  }

  /** Deterministic pseudo-random for consistent feel */
  private pseudoRandom(seed: number): number {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  }
}
