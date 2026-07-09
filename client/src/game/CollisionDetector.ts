// CollisionDetector.ts — Detects color match between ball and gate segment
// Gates scroll DOWN toward the ball (which is at fixed Y=0).
// A collision is checked when the gate crosses from above the ball to below it.
// The player can change the ball color up until the exact moment of crossing.

import { GateData } from "./GateManager";
import { PlayerBall } from "./PlayerBall";

export class CollisionDetector {
  // Track the last known Y of each gate to detect crossing
  private gateLastY = new WeakMap<GateData, number>();

  reset(): void {
    this.gateLastY = new WeakMap();
  }

  /**
   * Record the current gate Y position so we can detect crossing on the next frame.
   * Call this at the START of the update, before scrolling gates.
   */
  recordGateY(gate: GateData): void {
    this.gateLastY.set(gate, gate.baseY);
  }

  /**
   * Check if a gate has just crossed the ball's Y position.
   * A gate crosses when it was above the ball last frame and is now at or below the ball.
   * Returns "pass" if color matches, "crash" if it doesn't, null if no crossing.
   */
  checkForCrash(
    ball: PlayerBall,
    gate: GateData,
    ballY: number
  ): "pass" | "crash" | null {
    const lastY = this.gateLastY.get(gate);
    if (lastY === undefined) return null;

    // Gate crosses when it goes from above ballY to at or below ballY
    // lastY > ballY means gate was above ball last frame
    // gate.baseY <= ballY means gate is now at or below ball
    if (lastY > ballY && gate.baseY <= ballY) {
      // Gate just crossed the ball — check color match
      return this.evaluateCollision(ball, gate);
    }

    return null;
  }

  /**
   * Determine pass or crash based on ball color vs gate front segment.
   */
  private evaluateCollision(ball: PlayerBall, gate: GateData): "pass" | "crash" {
    // Find which segment is at the front (crossing angle) of the gate
    const rotationDeg = ((gate.mesh.rotation.y * 180) / Math.PI) % 360;
    const normalizedRot = ((rotationDeg % 360) + 360) % 360;

    // At rotation 0, segment 2 is at the front (angle 0° in our path system)
    // After rotating by R degrees, the front segment shifts
    const frontSegment = ((2 - Math.round(normalizedRot / 60)) % 6 + 6) % 6;
    const segmentColorIndex = gate.segmentColors[frontSegment];

    // Check if ball color matches the front segment color
    const ballColorIndex = ball.getCurrentColorIndex();
    return ballColorIndex === segmentColorIndex ? "pass" : "crash";
  }
}
