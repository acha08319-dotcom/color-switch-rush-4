# Memory 11 — Gates Too Far Above Camera

## Current state
- Ball at Y = -21.3 (falling at speed 5 for ~4.3 seconds)
- Camera at Y = -17.3 (offset of +4 from ball)
- First gate at Y = 10 (27 units above camera center)
- All 5 gates are above the camera

## The viewport math
Camera at Z=-15, FOV=1.3 (vertical radians).
Half-FOV = 0.65 radians.
At distance 15, half-viewport height = 15 * tan(0.65) ≈ 11.4 units.
Visible Y range from camera center Y=-17.3: [-28.7, -5.9]

So the viewport covers Y=-28.7 to Y=-5.9.
The first gate at Y=10 is well above this range (by 15.9 units).

## The fix
First gate needs to be within the viewport. It should be at roughly Y=-5 (top edge of viewport) or even lower. Since the ball starts at Y=0 and camera at Y=4, the visible range is roughly [-8, +16]. The first gate should be at Y=8 to Y=12 to be visible.

BUT — the ball is falling DOWN (Y decreasing), so the gate at Y=10 was never in the viewport because the camera starts at Y=4, not Y=0. The viewport at camera Y=4 covers [-8, +16], so gate at Y=10 SHOULD be visible.

Wait — the ball was at Y=-21 when I checked, which means it's been falling for 4+ seconds. At that point the camera is at Y=-17, and the gate at Y=10 is 27 units above. But the gate SHOULD have been visible at the start when camera was at Y=4.

The issue: the gate at Y=10 with Z=0, camera at (0,4,-15). The distance is sqrt(10^2 + 15^2) ≈ 18. The gate ring radius is 2.5. At distance 18, the ring diameter (5) subtends 2*atan(2.5/18) ≈ 15.8°. With FOV=1.3 rad ≈ 74°, the ring should take up about 21% of the vertical screen. That's definitely visible.

Unless... the emissive material is not rendering correctly in Babylon 4.x? Or the alpha blending is making it invisible against the dark background?

Let me try a different approach: reduce the gate spawn distance so the first gate is MUCH closer, and also try rendering a simple bright box at the gate position to verify.
