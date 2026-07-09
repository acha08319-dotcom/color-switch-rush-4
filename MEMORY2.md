# Memory 2 — Color Switch Rush Gameplay Observations

## Current state (after camera/ball adjustments)
The game is now playable but needs refinements:

### What works well
- Gates render beautifully as colorful rotating rings with 6 segments
- Gates spawn and scroll down, new gates appear above
- Ball is falling (eventually disappears below the viewport)
- Color cycling works on click

### Issues to address
1. **Ball disappears**: The ball falls below the viewport and isn't visible. Need to either:
   - Make the camera follow the ball vertically, OR
   - Start the ball higher in the viewport and have it fall through multiple gates before disappearing
2. **No HUD visible**: Score, multiplier, and combo bar are not visible during gameplay
3. **Camera needs to follow ball**: The ball should always be visible in the viewport
4. **Ball color change not visible**: When clicking, the ball color changes but it's hard to see since the ball falls quickly
5. **Need multiple gates visible simultaneously**: The game should show 2-3 gates at once with the ball between them

### Key fixes needed
- Camera should track the ball's Y position (smooth follow)
- HUD overlay needs to be visible (currently being rendered but might be behind the menu overlay or not updating)
- Gate spacing and ball fall speed need tuning
- The ball should start at the top of the viewport and fall through gates below it
