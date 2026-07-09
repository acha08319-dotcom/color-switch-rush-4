# Memory 5 — Color Cycling Works, Ball Approaching Gate

## Confirmed working
- Ball color changed from red to yellow on click — color cycling works!
- Gate is at the top of the viewport, slowly approaching as ball falls
- Camera follows ball properly

## Still need to fix
1. Gate spacing: first gate at Y=10, ball at Y=0. With fallSpeed=3, takes ~3.3 seconds to reach. This is too slow — the player should see gates coming at them more quickly.
2. HUD not visible — need to check if updateScore is being called
3. The game feels slow — need to adjust the perspective so gates appear closer

## Plan
- Reduce gate spacing to bring first gate closer (from Y+10 to Y+6)
- Increase initial fall speed slightly (from 3 to 5)
- Fix HUD rendering — the score/multiplier elements might not be showing
