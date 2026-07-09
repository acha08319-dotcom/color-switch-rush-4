// PlayerBall.ts — Owns the ball mesh, color state, cycling
// The ball is a glowing sphere at fixed position. Color cycles through 6 colors on each tap.

import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Engine } from "@babylonjs/core/Engines/engine";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { COLORS } from "./types";

export class PlayerBall {
  public mesh: Mesh;
  public material: StandardMaterial;
  private glowLayer: GlowLayer;
  private glowMesh: Mesh;
  private currentColorIndex: number = 0;
  private positionY: number;
  private engine: Engine;

  constructor(engine: Engine, scene: Scene, startY: number) {
    this.engine = engine;
    this.positionY = startY;

    // Create the ball sphere — larger for better visibility
    this.mesh = MeshBuilder.CreateSphere("ball", { diameter: 1.2, segments: 32 }, scene);
    this.mesh.position = new Vector3(0, this.positionY, 0);

    // Create material with strong emissive glow
    this.material = new StandardMaterial("ballMat", scene);
    this.material.emissiveColor = COLORS[0].color3.scale(1.3);
    this.material.specularColor = new Color3(1, 1, 1).scale(0.5);
    this.material.specularPower = 128;
    this.mesh.material = this.material;

    // Add glow layer for bloom effect
    this.glowLayer = new GlowLayer("ballGlow", scene);
    this.glowLayer.intensity = 0.7;
    this.glowLayer.addIncludedOnlyMesh(this.mesh);

    // Create an outer glow mesh (larger, semi-transparent)
    this.glowMesh = MeshBuilder.CreateSphere("ballGlowOuter", { diameter: 2.0, segments: 16 }, scene);
    const glowMat = new StandardMaterial("ballGlowMat", scene);
    glowMat.emissiveColor = COLORS[0].color3.scale(1.3);
    glowMat.alpha = 0.12;
    glowMat.backFaceCulling = false;
    this.glowMesh.material = glowMat;
    this.glowMesh.parent = this.mesh;

    // Set initial color
    this.setColorIndex(0);
  }

  setColorIndex(index: number): void {
    this.currentColorIndex = index;
    const c = COLORS[index].color3.scale(1.3);
    this.material.emissiveColor = c;
    (this.glowMesh.material as StandardMaterial).emissiveColor = c;
  }

  getCurrentColorIndex(): number {
    return this.currentColorIndex;
  }

  cycleColor(): void {
    this.currentColorIndex = (this.currentColorIndex + 1) % 6;
    this.setColorIndex(this.currentColorIndex);
  }

  update(delta: number): void {
    this.positionY -= 3 * delta;
    this.mesh.position.y = this.positionY;
  }

  getPositionY(): number {
    return this.positionY;
  }

  reset(y: number): void {
    this.positionY = y;
    this.mesh.position.y = y;
    this.currentColorIndex = 0;
    this.setColorIndex(0);
  }

  dispose(): void {
    this.glowLayer.dispose();
    this.mesh.dispose();
    this.material.dispose();
    this.glowMesh.dispose();
  }
}
