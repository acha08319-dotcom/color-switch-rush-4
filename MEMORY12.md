# Memory 12 — Even Debug Markers Not Visible

## Key insight
The camera is at Y=-15.8, looking at Y=-19.8 (the ball). The markers at Y=10 are 35.6 units above the camera center AND 35.6 units above the look target.

With FOV=1.3, the angular range visible is:
- Upward: cameraY + 15 * tan(0.65) ≈ -15.8 + 11.4 = -4.4
- Downward: cameraY - 15 * tan(0.65) ≈ -15.8 - 11.4 = -27.2

Wait, but the camera is looking at Y=-19.8, not at Y=-15.8. The camera target shifts the center of the FOV.

Actually, for a UniversalCamera in Babylon:
- camera.position is the camera location
- camera.target is what the camera looks at
- FOV determines the angular range around the look direction

The vertical viewport range in world coordinates:
- Upper edge: along the look direction + half FOV angle
- Lower edge: along the look direction - half FOV angle

Camera at (0, -15.8, -15), looking at (0, -19.8, 0).
Direction vector: (0, -4, 15) normalized ≈ (0, -0.257, 0.966)
This direction points slightly DOWN and forward.

Half FOV = 0.65 rad. The upward direction from look direction = rotate by +0.65 around X axis.
This gives a direction that points more upward.

The key issue: the camera is looking DOWN at the ball, so the upper part of the viewport is tilted upward but not enough to see objects at Y=10 which are 25+ units above the camera.

## Fix
Move the camera to a higher angle. Instead of looking down at the ball, use a shallower angle. Or use a larger FOV. Or position the camera differently.

Best approach: use camera at Z=-8 (closer), with a larger FOV of 1.5, and an offset that shows more of the upper area. This way gates at Y=10 will be visible when the ball is at Y=0.
