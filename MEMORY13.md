# Memory 13 — Camera Position Fix

## The data
- Ball at Y = -18.9
- Camera at Y = -18.9 (same as ball)
- Camera Z = -8, FOV = 1.5
- Visible range: Y = -26.3 to Y = -11.4
- First gate at Y = 7 (25.8 units above camera)
- ALL gates are above the visible range

## The fix
The camera needs to be positioned ABOVE the ball, not at the ball. With the camera at ballY + offset, the visible range shifts up.

Camera at ballY + 12:
- Camera Y = -18.9 + 12 = -6.9
- Visible range: -6.9 + 15 = 8.1 (top) to -6.9 - 15 = -21.9 (bottom)
- First gate at Y = 7 would be just below the top edge

Camera at ballY + 8:
- Camera Y = -18.9 + 8 = -10.9
- Visible range: -10.9 + 15 = 4.1 (top) to -10.9 - 15 = -25.9 (bottom)
- Gate at Y=7 is above visible range

Camera at ballY + 14:
- Camera Y = -18.9 + 14 = -4.9
- Visible range: -4.9 + 15 = 10.1 (top) to -4.9 - 15 = -19.9 (bottom)
- Gate at Y=7 is within range (between -19.9 and 10.1)
- Ball at -18.9 is also within range
- Perfect!

But we also need the camera target to be at the ball so the ball is centered. The camera position and target can be different.

Actually, with UniversalCamera, the look direction is from position to target. If position is at (0, -4.9, -8) and target is (0, -18.9, 0), the camera looks DOWN at the ball. The visible range then follows the look direction.

Let me recalculate: direction = (0, -18.9 - (-4.9), 8) = (0, -14, 8), normalized = (0, -0.868, 0.496)
The camera looks DOWN. The FOV creates a cone around this direction.
Upper edge of viewport: rotate the direction up by FOV/2 = 0.75 rad around X axis.
This tilts the upper edge even more downward... 

No, actually in Babylon, the FOV is symmetric around the look direction. The viewport is centered on the look direction, not on the camera's vertical axis.

So if the camera looks DOWN at the ball, the upper portion of the viewport actually points more horizontally, and the gate rings (which are horizontal) would be seen from an angle.

The key insight: we need the camera to look at the ball but be positioned high enough that the gates above the ball are in the viewport. With camera at (0, ballY+14, -8) looking at (0, ballY, 0):
- The look direction points slightly down
- The upper half of the viewport points more horizontally/forward
- Gates at ballY+7 would be above the look target by 7 units, at distance ~8 from camera
- They'd be at angle atan(7/8) ≈ 41° above the look direction
- With FOV/2 = 0.75 rad ≈ 43°, they'd be JUST within the viewport

Let me try camera at ballY + 12 with offset target.
