# Color Switch Rush

> **A kinetic tunnel arcade game for YouTube Playables.** Match the ball to the rotating gate, build the rush, and survive one more pass.

Color Switch Rush is a fast, restartable Babylon.js arcade game designed around a single readable action: **tap, click, or press Space to cycle the ball color before the next gate crosses the center line**. The experience is intentionally non-monetized and does not depend on external accounts, third-party runtime services, or in-game advertising.

## What is in the build

| System | Experience |
| --- | --- |
| Core loop | Fixed-center ball, scrolling rotating gates, six-color matching, instant collision feedback |
| Score tension | Consecutive passes increase the combo multiplier and charge a visible RUSH meter |
| Daily Challenge | Date-seeded gate generation gives every player the same sequence for the current day |
| Impact polish | Screen shake, particles, warning pulse, procedural Web Audio effects, and optional haptics |
| Onboarding | First-launch “How to Play” overlay with color-cycle guidance and combo advice |
| Social play | Daily best and all-time best persistence; local preview score sharing only |
| Playables host | SDK lifecycle, audio state, pause/resume, save data, locale lookup, score submission, and health logging |
| Responsive presentation | Safe-area-aware HUD, device-pixel-ratio canvas resizing, touch/mouse/keyboard input, and viewport fill behavior |

## Controls

- **Tap or click** anywhere on the game canvas to cycle color.
- **Space** cycles color on keyboard.
- **Escape** pauses in local preview; Playables resumes through YouTube controls.
- **Vibration** is optional and opt-in from the menu when supported by the device.

## Visual direction

The game follows a **kinetic arcade** direction: deep navy space, electric cyan energy, gold RUSH feedback, saturated color gates, sharp type, short motion bursts, and high-contrast feedback that remains legible in portrait, square, landscape, and ultrawide viewports. The gameplay view is deliberately immediate rather than surrounded by a conventional app shell.

## YouTube Playables compatibility

The SDK script is loaded before the Vite entrypoint. The game calls `firstFrameReady()` before `gameReady()`, waits for persistence hydration before showing the playable menu, and keeps all SDK calls behind a guarded adapter with local fallbacks.

The responsive shell uses `viewport-fit=cover`, safe-area insets, a full-viewport canvas, no orientation lock, and no scrollable page surface. HUD values use responsive sizing so the game remains readable at compact portrait widths and large desktop-like surfaces. The runtime does not rely on Google Fonts, external analytics, remote images, monetization APIs, or third-party runtime assets.

Playables mode also follows the host interaction policy: no in-game exit control, no additional agreement prompt, no external clickable links, and no in-game sharing prompt. Score sharing is retained only for local preview convenience and is hidden in the Playables host.

The implementation notes and source references are collected in [`PLAYABLES_REQUIREMENTS.md`](./PLAYABLES_REQUIREMENTS.md).

## Local development

```bash
pnpm install
pnpm dev
```

Open the Vite URL printed by the dev server. To run the same production build used for deployment checks:

```bash
pnpm check
pnpm build
pnpm preview
```

The repository uses **pnpm**, **React 19**, **TypeScript**, **Vite**, and **Babylon.js**. The game itself is orchestrated from `client/src/game/GameWorld.ts`; the Playables boundary is `client/src/game/YtGameAdapter.ts`.

## Validation checklist

Before submitting a build to the YouTube Playables Test Suite:

1. Run `pnpm check` and `pnpm build`.
2. Test first-frame loading, tutorial dismissal, normal play, daily play, crash, restart, pause, resume, and reload persistence.
3. Test touch, mouse, Space, and Escape behavior.
4. Verify the game in portrait, square, 4:3, 16:9, ultrawide, and very tall viewports.
5. Confirm that the page has no horizontal or vertical scrolling and that the canvas resizes without losing the current run.
6. Test the hosted URL with YouTube’s official Content-Security-Policy and Playables Test Suite tools.
7. Confirm that local-only sharing remains hidden when `ytgame.IN_PLAYABLES_ENV` is true.

Local checks completed for this upgrade pass: **TypeScript validation passes** and the build is configured around the official SDK-before-entrypoint order. Certification still must be performed against the hosted URL in YouTube’s Test Suite; a local pass is not a certification result.

## Repository map

```text
client/
  index.html                  Playables SDK boot order and responsive metadata
  src/components/GameCanvas.tsx  Babylon engine lifecycle bridge
  src/game/GameWorld.ts       Game loop, modes, scoring, pause, and effects
  src/game/GateManager.ts     Gate creation, seeded sequence, and upcoming colors
  src/game/UIController.ts   HUD, tutorial, menu, pause, daily, and game-over UI
  src/game/YtGameAdapter.ts   Guarded YouTube Playables SDK integration
  src/game/HapticsManager.ts Opt-in device vibration feedback
  src/game/StorageAdapter.ts Resilient local persistence fallback
PLAYABLES_REQUIREMENTS.md     Verified host requirements and references
ASSETS.md                     Original visual direction notes
ideas.md                      Selected design direction and upgrade scope
```

## Suggested next upgrades

The next useful improvements are **practice mode with a selectable speed**, **a local replay ghost for the current day’s best run**, and **small accessibility options for reduced motion, high contrast, and color-vision-safe gate symbols**. These extend skill depth and clarity without introducing monetization or accounts.

## License

MIT
