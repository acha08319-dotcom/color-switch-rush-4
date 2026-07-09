# Color Switch Rush

## Runtime

- Babylon.js 9.16.0
- TypeScript + Vite
- React 19 (WebDev host)
- Dimension: 2D (orthographic front-facing view)

## App Entry

- `index.html` -> `main.tsx` (React entry)
- `App.tsx` -> renders `<GameCanvas />` as sole `/` route
- `client/src/components/GameCanvas.tsx` -> Babylon engine + canvas lifecycle
- `client/src/game/scene.ts` -> exports `createGameScene(engine, canvas): Promise<GameHandle>`

## Game Entry

- `client/src/game/scene.ts` — main scene entrypoint, wires all systems together
- `client/src/game/types.ts` — shared types (color palette, game state, interfaces)

## Planned Modules

| Module | File | Responsibility |
|--------|------|----------------|
| `GameWorld` | `client/src/game/GameWorld.ts` | Main update loop, orchestration, game state management |
| `PlayerBall` | `client/src/game/PlayerBall.ts` | Ball mesh, color state, color cycling, auto-fall logic |
| `GateManager` | `client/src/game/GateManager.ts` | Gate ring creation, rotation, spawning/despawning, speed progression |
| `CollisionDetector` | `client/src/game/CollisionDetector.ts` | Color match detection between ball and gate segment at crossing angle |
| `ScoreManager` | `client/src/game/ScoreManager.ts` | Score tracking, combo/multiplier logic, high score persistence |
| `InputManager` | `client/src/game/InputManager.ts` | Tap/click/spacebar → color cycle input |
| `UIController` | `client/src/game/UIController.ts` | DOM-based HUD overlay (score, multiplier, game over screen) |
| `ParticleManager` | `client/src/game/ParticleManager.ts` | Pass-through glow particles, crash burst particles |
| `assets` | `client/src/game/assets.ts` | `/manus-storage/...` URL imports for textures |

## Data Model

- **Colors:** 6-game colors in order: `[red, orange, yellow, green, cyan, purple]`
  - Each color has a Babylon `Color3` value and a CSS hex for DOM HUD
- **Ball color index:** 0–5, cycles forward on tap
- **Gate segment layout:** 6 segments, each 60°, starting from top (0° = top, clockwise)
- **Game state:** `playing` | `gameOver`
- **Score:** integer, increments +1 per pass
- **Combo/multiplier:** integer, increments +1 per consecutive pass, resets to 1 on crash
- **Rotation speed:** starts at ~60°/s, increases by ~15% every 5 seconds

## Assets

- Runtime textures via `/manus-storage/...` URLs (no local files in project tree)
- Procedural meshes: sphere (ball), torus-like rings (gates built from arc segments)
- Particle effects: sprite particles from generated glow/burst textures

## Verification

- `pnpm check` — TypeScript compilation
- `webdev_take_screenshot` — visual verification via WebDev preview
- `?demo` query param — deterministic AutoPilot mode for screenshot capture
