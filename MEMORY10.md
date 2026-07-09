# Memory 10 — Camera Lerp Bug Found

## The actual data
- Ball position: Y = -38.8 (has been falling for ~7.8 seconds at speed 5)
- Camera position: Y = -36.5 (trying to follow but behind)
- Camera target: Y = -36.8 (slightly behind ball)
- Gates: at Y = 10, 16, 22, 28, 34 (all way above the camera)

## Root cause
The camera lerp with factor=8 is not fast enough to keep up with the ball falling at speed 5. After ~8 seconds, the ball is at Y=-38 but camera is at Y=-36.5. The gates at Y=10 are 46 units above the camera — completely out of view.

## The fix
The lerp factor needs to be MUCH higher, or the camera should just directly follow the ball without lerp. Alternatively, use a hard offset: camera.position.y = ballY + offset.

The lerp approach is: cameraY += (targetY - cameraY) * lerpFactor * delta
With lerpFactor=8 and delta=0.016, the correction per frame is only 0.128 * (targetY - cameraY).
At the start when ballY=0 and cameraY=5, the diff is -3, correction = -0.384/frame.
This takes many frames to catch up.

## Fix: Direct camera follow with offset
camera.position.y = ballY + cameraOffsetY;
camera.setTarget(new Vector3(0, ballY, 0));

This is instant and guarantees the camera is always at the right position.
