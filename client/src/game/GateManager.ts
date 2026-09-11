// GateManager.ts — Creates and manages rotating colored gate rings
// Gates spawn above the ball and scroll down.
// Gate spacing is tuned so 2-3 gates are visible at a time.

import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { COLORS, type ColorIndex } from "./types";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { SeededRandom } from "./SeededRandom";

export interface GateData {
  mesh: Mesh;
  segments: Mesh[];
  rotationSpeed: number;
  baseY: number;
  segmentColors: ColorIndex[];
}

export class GateManager {
  private scene: Scene;
  private gates: GateData[] = [];
  private baseRotationSpeed: number = 1.5;
  private nextSpawnY: number;
  private gateSpacing: number = 6; // units between gates
  private rng: SeededRandom | null = null;

  constructor(scene: Scene, startSpawnY: number, rng?: SeededRandom) {
    this.scene = scene;
    this.nextSpawnY = startSpawnY;
    this.rng = rng ?? null;
  }

  setRNG(rng: SeededRandom): void {
    this.rng = rng;
  }

  createGate(y: number): GateData {
    const available = [0, 1, 2, 3, 4, 5];
    if (this.rng) {
      this.rng.shuffle(available);
    } else {
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
    }
    const segmentColors = available as ColorIndex[];

    // Create parent mesh for the gate
    const parentMesh = new Mesh(`gate_${y}`, this.scene);
    parentMesh.position = new Vector3(0, y, 0);

    const ringRadius = 2.5;
    const tubeRadius = 0.32;

    // Create 6 arc segments (60° each)
    const segmentMeshes: Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const startAngle = (i * 60 - 150) * (Math.PI / 180);
      const endAngle = ((i + 1) * 60 - 150) * (Math.PI / 180);

      const path: Vector3[] = [];
      const numPoints = 24;
      for (let t = 0; t <= numPoints; t++) {
        const angle = startAngle + (endAngle - startAngle) * (t / numPoints);
        const x = ringRadius * Math.sin(angle);
        const z = ringRadius * Math.cos(angle);
        path.push(new Vector3(x, 0, z));
      }

      const segment = MeshBuilder.CreateTube(
        `seg_${i}`,
        { path, radius: tubeRadius, cap: 3, sideOrientation: 2 },
        this.scene
      );

      const mat = new StandardMaterial(`gateMat_${i}_${y}`, this.scene);
      // Bright emissive color with strong glow effect
      mat.emissiveColor = COLORS[segmentColors[i]].color3.scale(1.8);
      mat.specularColor = new Color3(1, 1, 1).scale(0.3);
      mat.specularPower = 128;
      mat.alpha = 1;
      segment.material = mat;
      segment.parent = parentMesh;

      segmentMeshes.push(segment);
    }

    const randomOffset = this.rng ? this.rng.next() * 0.8 : Math.random() * 0.8;
    const rotationSpeed = this.baseRotationSpeed + randomOffset;

    return {
      mesh: parentMesh,
      segments: segmentMeshes,
      rotationSpeed,
      baseY: y,
      segmentColors,
    };
  }

  spawnGate(): void {
    const gate = this.createGate(this.nextSpawnY);
    this.gates.push(gate);
    this.nextSpawnY += this.gateSpacing;
  }

  /**
   * Update gates: scroll gates DOWN toward the ball, rotate, despawn below ball, spawn above.
   * @param delta — time delta in seconds
   * @param scrollSpeed — how fast gates scroll down (units per second)
   */
  update(delta: number, scrollSpeed: number): void {
    for (let i = this.gates.length - 1; i >= 0; i--) {
      const gate = this.gates[i];
      // Rotate the gate
      gate.mesh.rotation.y += gate.rotationSpeed * delta;

      // Scroll gate downward
      gate.baseY -= scrollSpeed * delta;
      gate.mesh.position.y = gate.baseY;

      // Despawn if gate has passed below the ball by a margin
      if (gate.baseY < -15) {
        this.removeGate(i);
      }
    }

    // Spawn new gates above — maintain a steady stream of gates
    // Keep spawning gates up to Y=30 (well above visible area for anticipation)
    while (this.nextSpawnY <= 30) {
      this.spawnGate();
      const lastGate = this.gates[this.gates.length - 1];
      lastGate.mesh.position.y = lastGate.baseY;
    }
  }

  removeGate(index: number): void {
    const gate = this.gates[index];
    gate.mesh.dispose(false, true);
    for (const seg of gate.segments) {
      seg.material?.dispose();
    }
    this.gates.splice(index, 1);
  }

  getGates(): GateData[] {
    return this.gates;
  }

  /** Return the front-segment colors for the next gates, closest first. */
  getUpcomingColorIndices(ballY: number, count = 3): ColorIndex[] {
    return this.gates
      .filter((gate) => gate.baseY > ballY + 0.2)
      .sort((a, b) => a.baseY - b.baseY)
      .slice(0, count)
      .map((gate) => {
        const rotationDeg = ((gate.mesh.rotation.y * 180) / Math.PI) % 360;
        const normalizedRot = ((rotationDeg % 360) + 360) % 360;
        const frontSegment = ((2 - Math.round(normalizedRot / 60)) % 6 + 6) % 6;
        return gate.segmentColors[frontSegment];
      });
  }

  prepareContinuation(gateCount: number, ballY: number): void {
    // Remove the crashed gate and any gates already behind the player.
    for (let i = this.gates.length - 1; i >= 0; i--) {
      if (this.gates[i].baseY <= ballY + 0.5) this.removeGate(i);
    }

    // Keep the continuation predictable: ensure at least the requested number
    // of gates are ahead before normal spawning resumes.
    const futureGates = this.gates.filter((gate) => gate.baseY > ballY + 0.5);
    if (futureGates.length === 0) {
      this.nextSpawnY = Math.max(this.nextSpawnY, ballY + 12);
    }

    while (this.gates.filter((gate) => gate.baseY > ballY + 0.5).length < gateCount) {
      this.spawnGate();
    }
  }

  setRotationSpeed(increment: number): void {
    this.baseRotationSpeed += increment;
    for (const gate of this.gates) {
      gate.rotationSpeed += increment;
    }
  }

  dispose(): void {
    for (const gate of this.gates) {
      this.removeGate(0);
    }
  }
}
