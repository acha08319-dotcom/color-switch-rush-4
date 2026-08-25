// scene.ts — Main game scene entrypoint for Color Switch Rush
// Static camera with scrolling gates. Ball stays at fixed Y=0.
// Gates spawn above and scroll down toward the ball.
// Includes a demo mode that shows a rotating gate and glowing ball on the menu.

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PlayerBall } from "./PlayerBall";
import { GateManager } from "./GateManager";
import { GameWorld } from "./GameWorld";

export interface GameHandle {
  scene: Scene;
  world: GameWorld;
  dispose(): void;
}

// Demo mode: a small gate + ball that rotate on the menu screen
let demoBall: PlayerBall | null = null;
let demoGateManager: GateManager | null = null;

export function startDemo(scene: Scene, engine: Engine): void {
  demoBall = new PlayerBall(engine, scene, 0);
  demoGateManager = new GateManager(scene, 5);
}

export function stopDemo(): void {
  if (demoBall) {
    demoBall.dispose();
    demoBall = null;
  }
  if (demoGateManager) {
    demoGateManager.dispose();
    demoGateManager = null;
  }
}

export function updateDemo(delta: number): void {
  if (demoGateManager) {
    demoGateManager.update(delta, 2);
  }
  if (demoBall) {
    demoBall.mesh.position.y = 0;
  }
}

/** Create tunnel wall meshes that give depth to the scene */
function createTunnelWalls(scene: Scene): void {
  const wallCount = 8;
  const tunnelRadius = 4.5;
  const segmentAngle = Math.PI * 2 / wallCount;

  for (let i = 0; i < wallCount; i++) {
    const angle = i * segmentAngle;
    const x = Math.sin(angle) * tunnelRadius;
    const z = Math.cos(angle) * tunnelRadius;

    // Create vertical wall strips — long cylinders positioned around the perimeter
    const wall = MeshBuilder.CreateCylinder(
      `wall_${i}`,
      { height: 80, diameter: 0.3, tessellation: 8 },
      scene
    );
    wall.position = new Vector3(x, 0, z);

    const mat = new StandardMaterial(`wallMat_${i}`, scene);
    mat.emissiveColor = new Color3(0.04, 0.04, 0.12);
    mat.alpha = 0.6;
    wall.material = mat;
  }

  // Top and bottom caps
  for (const y of [-40, 40]) {
    const cap = MeshBuilder.CreateDisc("cap", { radius: tunnelRadius, tessellation: 32 }, scene);
    cap.position = new Vector3(0, y, 0);
    cap.rotation.x = Math.PI / 2;
    const mat = new StandardMaterial("capMat", scene);
    mat.emissiveColor = new Color3(0.02, 0.02, 0.05);
    mat.alpha = 0.3;
    mat.backFaceCulling = false;
    cap.material = mat;
  }
}

export async function createGameScene(
  engine: Engine,
  canvas: HTMLCanvasElement
): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.02, 0.02, 0.08, 1);

  // Static camera
  const camera = new UniversalCamera("camera", new Vector3(0, 3, -8), scene);
  camera.setTarget(new Vector3(0, 0, 0));
  camera.fov = 1.3;
  camera.inputs.clear();

  // Ambient light
  const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.35;
  hemiLight.diffuse = new Color3(0.5, 0.5, 0.7);

  // Point light near the ball for dramatic glow
  const ballLight = new PointLight("ballLight", new Vector3(0, 0, 0), scene);
  ballLight.intensity = 0.6;
  ballLight.diffuse = new Color3(1, 1, 1);

  // Create tunnel walls for depth perception
  createTunnelWalls(scene);

  // Start demo mode for the menu
  startDemo(scene, engine);

  // Create GameWorld
  const gameWorld = new GameWorld(engine, scene, camera, canvas);

  // Mount HUD and keep the Playables host on a loading state until cloud save
  // hydration completes. The menu is shown only after the game is interactable.
  gameWorld.mount();
  gameWorld.showLoading();
  await gameWorld.preparePersistence();

  // Register update loop
  scene.onBeforeRenderObservable.add(() => {
    const delta = scene.getEngine().getDeltaTime() / 1000;
    const clampedDelta = Math.min(delta, 0.05);

    // Update demo if active
    updateDemo(clampedDelta);

    // Point light stays at ball position (Y=0)
    ballLight.position = new Vector3(0, gameWorld.ballY, 0);

    gameWorld.update(clampedDelta);
  });

  // Initialize — shows the menu screen
  gameWorld.init();

  // Expose scene for debugging
  (window as any).__babylon_scene__ = scene;
  (window as any).__startDemo = () => startDemo(scene, engine);
  (window as any).__stopDemo = stopDemo;

  return {
    scene,
    world: gameWorld,
    dispose: () => {
      stopDemo();
      gameWorld.stop();
      camera.inputs.clear();
      scene.dispose();
    },
  };
}
