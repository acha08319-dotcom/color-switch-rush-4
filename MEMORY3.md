# Memory 3 — Camera Follow Issue

The camera is not following the ball. The ball falls but the camera stays at Y=10, so the ball falls out of view and the gates drift down. The issue is that the camera smooth-follow uses a very slow lerp (0.08 * delta * 60) which is essentially just 0.08 per frame. The camera should move much faster to keep up with the ball.

Also, the HUD (score, multiplier) is not visible — this might be because the menu overlay elements remain or the HUD elements are created but the menu HTML still covers them.

## Fixes needed
1. Camera follow: increase lerp factor significantly (e.g., 5-10 instead of 0.08)
2. Ball starts at Y=15 with camera at Y=20, but ball falls down quickly. The camera needs to track more aggressively.
3. HUD: The menu HTML might still be in the DOM after starting the game — need to ensure clearHUD removes menu HTML properly.
