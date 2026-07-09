// ParticleManager.ts — Manages particle effects for pass-through and crash
// Pass-through: soft glow ring particles that expand outward
// Crash: bright burst particles that explode outward from the ball

import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { COLORS, type ColorIndex } from "./types";

interface Particle {
  mesh: Mesh;
  material: StandardMaterial;
  velocity: Vector3;
  life: number;
  maxLife: number;
  initialSize: number;
  fadeInEnd: number;
}

export class ParticleManager {
  private scene: Scene;
  private particles: Particle[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /** Emit pass-through glow particles at the ball position */
  emitPassGlow(ballY: number, colorIndex: ColorIndex = 0): void {
    const color = COLORS[colorIndex].color3;
    // Ring of particles expanding outward
    const count = 8;
    for (let i = 0; i < count; i++) {
      const size = 0.6 + Math.random() * 0.4;
      const mesh = MeshBuilder.CreatePlane("passP", { size }, this.scene);
      const mat = new StandardMaterial(`passMat_${i}`, this.scene);
      mat.emissiveColor = color.scale(1.5);
      mat.alpha = 0;
      mat.backFaceCulling = false;
      mesh.material = mat;

      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const radius = 0.8 + Math.random() * 0.4;
      mesh.position = new Vector3(
        Math.cos(angle) * radius,
        ballY + (Math.random() - 0.5) * 0.3,
        Math.sin(angle) * radius
      );
      mesh.lookAt(new Vector3(0, ballY, 0));

      const vel = new Vector3(
        Math.cos(angle) * (2 + Math.random()),
        (Math.random() - 0.5) * 1,
        Math.sin(angle) * (2 + Math.random())
      );

      this.particles.push({
        mesh,
        material: mat,
        velocity: vel,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.2,
        initialSize: size,
        fadeInEnd: 0.1,
      });
    }
  }

  /** Emit crash burst particles at the ball position */
  emitCrashBurst(ballY: number, colorIndex: ColorIndex = 0): void {
    const ballColor = COLORS[colorIndex].color3;
    const crashOrange = new Color3(1, 0.4, 0.1);

    for (let i = 0; i < 20; i++) {
      const size = 0.3 + Math.random() * 0.5;
      const mesh = MeshBuilder.CreatePlane("crashP", { size }, this.scene);
      const mat = new StandardMaterial(`crashP_${i}`, this.scene);
      // Mix ball color with crash orange, bias toward orange for dramatic effect
      const mixRatio = 0.3 + Math.random() * 0.4;
      mat.emissiveColor = ballColor.scale(1 - mixRatio).add(crashOrange.scale(mixRatio));
      mat.alpha = 0;
      mat.backFaceCulling = false;
      mesh.material = mat;

      mesh.position = new Vector3(0, ballY, 0);

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 4 + Math.random() * 6;
      const vel = new Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed * 0.5,
        Math.sin(phi) * Math.sin(theta) * speed
      );

      this.particles.push({
        mesh,
        material: mat,
        velocity: vel,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.3,
        initialSize: size,
        fadeInEnd: 0.08,
      });
    }
  }

  update(delta: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        p.mesh.dispose();
        p.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }

      // Move particle
      p.mesh.position.addInPlace(p.velocity.scale(delta));
      p.velocity.scaleInPlace(0.97); // slight drag

      // Fade in then fade out
      let alpha = 0;
      if (p.life < p.fadeInEnd) {
        alpha = p.life / p.fadeInEnd; // fade in
      } else {
        const remaining = 1 - (p.life - p.fadeInEnd) / (p.maxLife - p.fadeInEnd);
        alpha = Math.max(0, remaining); // fade out
      }
      p.material.alpha = alpha * 0.7;

      // Scale up slightly as particle lives
      const scale = 1 + p.life / p.maxLife * 0.5;
      p.mesh.scaling = new Vector3(scale, scale, scale);
    }
  }

  dispose(): void {
    for (const p of this.particles) {
      p.mesh.dispose();
      p.material.dispose();
    }
    this.particles = [];
  }
}
