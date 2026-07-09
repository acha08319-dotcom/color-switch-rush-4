# Memory 14 — Gates Spawn But Ball Falls Too Fast

## The data after ~8.4 seconds of play
- Ball at Y = -41.9 (falling at speed 5 for ~8.4 seconds)
- Camera at Y = -29.9 (ball + 12 offset)
- Visible Y range: -37.3 to -22.4
- Gates: at Y = 7, 13, 19, 25, 31 (ALL above the visible range)

## The problem
The game was designed with static gates. The first gate was spawned at Y=7 when the ball was at Y=0. The ball falls at speed 5, so it passes Y=7 in 1.4 seconds. The gate should have been visible briefly and the ball should have collided with it.

But looking at the current screenshot, the ball is still visible and there's NO "Game Over" screen. This means the collision is NOT being detected — the ball just passes through the gate without triggering anything.

Also, no new gates are being spawned as the ball falls because the spawn logic in GateManager checks `nextSpawnY < maxVisibleY + 20`. But `maxVisibleY` is `ballY + 15` which is -41.9 + 15 = -26.9. The `nextSpawnY` is 37 (after 5 spawns at +6 each). So 37 < -26.9 + 20 = -6.9 is FALSE. No new gates spawn because `nextSpawnY` is already way above.

## Root causes
1. **Collision not detected** — the CollisionDetector probably isn't working correctly
2. **No new gates spawn** — the spawn logic assumes gates fall down with the ball, but gates are static

## Fix approach
The fundamental issue is the game model. With static gates and a falling ball:
- Gates need to be spawned at the ball's current position + distance ahead
- The spawn logic needs to use the ball position, not the camera position
- Or: gates should move DOWN toward the ball (scrolling approach)

The scrolling approach is simpler and more visually intuitive. Let me switch back to: gates move DOWN toward the ball at the same speed the ball falls. The ball stays at a fixed Y position. The camera is static.

This is actually the most natural approach for this type of game.
