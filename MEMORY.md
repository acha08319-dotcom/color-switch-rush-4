# Memory — Color Switch Rush Development Notes

## Observations from first gameplay test (2026-07-09)

### What works
- Menu screen renders beautifully with title, color dots, and CTA button
- Ball renders as a glowing red sphere with outer glow effect — looks great
- Gates spawn and are visible at top of screen with 6 colored segments
- Gates are rotating (visible color segments at top of screen)
- Camera position and FOV show the gameplay area

### Issues to fix
1. **Gate positioning**: Gates spawn above the visible area (only bottom edge visible at top of screen). The ball starts at Y=10, gates spawn at Y=20. Need to adjust spawn positions so gates are visible in the camera's view.
2. **HUD not visible**: The score, multiplier, and combo bar HUD elements are not showing during gameplay. The ball is the only visible element besides the gate at the top.
3. **Ball position**: Ball is centered in the viewport but gates are mostly above the visible area. Need to adjust camera or positions so both are visible.

### Camera/Gateway adjustments needed
- Current camera: (0, 5, -12) looking at (0, 0, 0)
- Ball starts at Y=10, so it's above the camera target
- Gates spawn at Y=20 (above ball)
- Need camera to look higher, or adjust ball start position to be in view
- Suggestion: camera at (0, 15, -12) looking at (0, 10, 0), or ball start at Y=0

### Gate visibility
- The colored gate ring is partially visible at the top of the screen — this means the gate radius (2.5) combined with camera FOV (1.2) is working
- Gate tube radius (0.25) looks appropriate

### Color cycling
- Need to verify by clicking the canvas to cycle the ball color
