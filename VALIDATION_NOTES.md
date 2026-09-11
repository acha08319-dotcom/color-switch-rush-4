# Validation Notes

## 2026-09-11 local preview

The refreshed preview rendered the first-launch tutorial with the kinetic tunnel background and dismissed into the menu. The menu exposed `TAP TO PLAY`, `DAILY CHALLENGE`, and an opt-in `VIBRATION ON/OFF` control. Daily Challenge entered the run and displayed the daily-mode badge, RUSH meter, combo HUD, and upcoming-gate rail.

The game-over screen initially exposed a layout defect where `Daily Best` could join the action-button row. The UI was changed to use stable `hud-gameover-overlay` and `hud-gameover-buttons` IDs. A second Daily Challenge run now renders `Daily Best` as a separate label above `SHARE SCORE` and `PLAY AGAIN`.

Local preview correctly keeps `SHARE SCORE` available as a convenience outside the YouTube host. Playables mode passes `allowShare = false`, so the sharing prompt is not part of the embedded-host UI. The local browser run, daily mode, and crash flow remain interactive after the responsive shell and non-monetized Playables cleanup.

## Automated checks

- `pnpm check`: passed.
- `pnpm build`: passed; Vite emits the existing Babylon.js large-chunk warning.
- Dev server restart: passed.

## Final polish validation

A zero-JavaScript branded boot shell was added to `client/index.html`. It presents the Color Switch Rush wordmark, six-segment spectrum ring, tunnel grid, and loading bar before React/Babylon initialization, then is removed after the first rendered Babylon frame. Initialization errors leave a readable `LOAD ERROR — RESTART` state instead of an empty canvas.

The top-viewport mobile capture at 390x844 shows the first-launch tutorial as an in-tunnel overlay with readable touch-sized controls. The desktop local preview shows the branded menu with the tunnel demo, six color indicators, `TAP TO PLAY`, opt-in vibration control, and `DAILY CHALLENGE`.

Final checks completed:

- `pnpm check`: passed.
- `pnpm build`: passed; Vite reports only the existing Babylon.js chunk-size warning.
- `git diff --check`: passed.
- No active monetization API references were found in `client/src` or `README.md`.
- Local preview verified menu, Daily Challenge, HUD, crash, game-over daily-best placement, and responsive viewport behavior.

YouTube's official hosted Test Suite remains the certification step; local validation cannot certify a hosted Playable.
