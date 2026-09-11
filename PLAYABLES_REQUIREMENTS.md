# YouTube Playables Compatibility Notes

Last verified: 2026-09-10

## Official requirements confirmed

YouTube Playables must be responsive across all aspect ratios, including very tall portrait, standard portrait, square, 4:3, 16:9, ultrawide, and panoramic layouts. The game should fill the available viewport, must not lock orientation, and must preserve game state or progress when the viewport changes. Text and graphics must remain clear across resolutions and pixel densities. Touch and mouse input are required; keyboard input is recommended. Modal dialogs should support closing with Escape, and the game must not call `preventDefault()` on Escape. [1] [2]

The SDK script must be loaded before all game code. The game must call `ytgame.game.firstFrameReady()` before `ytgame.game.gameReady()`, and `gameReady()` must not be called while a loading screen is visible. Required integrations include audio-state synchronization, pause/resume callbacks, and save-data load/save. Recommended integrations include locale lookup, score submission, and health logging. [3] [4]

The official SDK Test Suite checks integration behavior and recommends testing locally with YouTube's Content-Security-Policy response header. The published CSP allows self-hosted code and data/blob assets, YouTube SDK script origins, Google Fonts, and same-origin/blob/data connections; external runtime dependencies should not be assumed. [5]

Playables design requirements disallow in-game sharing prompts, external clickable links, additional user agreements, and in-game exit/quit buttons that conflict with YouTube controls. This build therefore keeps score sharing disabled in Playables mode while retaining it only as a local-preview convenience, and it does not add monetization or external-link flows. [2]

## Current project status

The project already loads the SDK before the entrypoint, exposes typed SDK declarations, wraps lifecycle/audio/pause/resume/save/score/health APIs, and uses guarded local persistence outside the YouTube host. The next hardening pass should add explicit viewport-resize handling, safe-area-aware UI, canvas/DPR sizing, a Playables-mode UI policy for disallowed local-preview controls, and a local CSP/test harness or documented Test Suite procedure.

## References

[1]: https://developers.google.com/youtube/gaming/playables/certification/requirements_design "YouTube Playables design requirements"
[2]: https://developers.google.com/youtube/gaming/playables/certification/requirements_design "YouTube Playables interaction, UI, and disallowed-element requirements"
[3]: https://developers.google.com/youtube/gaming/playables/reference/getting_started "YouTube Playables SDK getting started"
[4]: https://developers.google.com/youtube/gaming/playables/reference/sdk "YouTube Playables SDK reference"
[5]: https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide "YouTube Playables SDK Test Suite guide"
