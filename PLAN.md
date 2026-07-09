# Game Plan: Color Switch Rush

## Risk Tasks

No high-risk features identified. This is a procedural geometry + color-matching arcade game. All tasks are routine and go in the main build.

## Main Build

- **Assets needed:**
  - `tunnel_bg` — dark navy tunnel background texture for the scene backdrop (fullscreen)
  - `ball_glow` — soft glow particle sprite for pass-through effects
  - `particle_burst` — burst/spark particle sprite for crash effects

- **Verify:**
  - Ball falls continuously at smooth, consistent speed
  - Tap/click/spacebar cycles ball color through 6 colors (red, orange, yellow, green, cyan, purple)
  - Gates are circular rings with 6 colored segments (60° each), rotating continuously
  - Gate rotation speed increases over time (e.g., every 10 seconds or every 5 passes)
  - New gates spawn above viewport as old ones pass below (endless scrolling)
  - Collision detection: ball passes through gate if ball color matches the segment at the crossing angle
  - Pass-through increments score +1 and combo/multiplier +1
  - Crash on color mismatch stops ball, shows game over screen with final score and multiplier
  - Multiplier resets to 1 on crash
  - HUD shows: score (top-right), multiplier (top-center, gold glow), high score
  - Game over overlay shows final score, multiplier, and replay button
  - Pass-through glow particle effect visible on successful pass
  - Crash burst particle effect visible on miss
  - No missing textures or placeholder materials
  - No browser console errors during capture
  - reference.png consistency: color palette (navy bg, 6 vibrant gate colors, white ball, gold UI accents), scale, camera angle, visual density
