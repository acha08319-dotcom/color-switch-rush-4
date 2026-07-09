# Memory 7 — Gates Not Visible

## Problem
The gates spawn at Y=8, Y=15, Y=22, etc. The ball starts at Y=0. The camera is at Y=0 with targetY=0. But the gates at Y=8+ are ABOVE the camera, and with the orthographic camera at Z=-12, the viewport covers roughly Y=-8 to Y=+8. So the first gate at Y=8 is just barely visible at the very top edge.

After ~1.5 seconds, the ball falls to Y=-8 (camera at Y=-6), and the first gate at Y=8 should now be at the top of the viewport. But no gates are visible at all.

## Root cause hypothesis
1. The gates might be spawning but not visible because the camera angle/fov doesn't show them
2. OR the gates are being despawned immediately because minVisibleY calculation is wrong
3. OR the gates are at positive Z values and the camera is looking at the wrong direction

## Debugging needed
Check if gates are actually in the scene by looking at the GateManager.getGates() output. Also check the camera FOV and direction.

Actually, the most likely issue: the camera is at Y=0 looking at Y=0, but gates are at Y=8. With orthographic camera, the viewport is roughly cameraY +/- some range. The first gate at Y=8 should be at the very top. But it's not showing.

Wait — looking at the screenshot again, there's a thin red bar at the very top of the viewport. That might be a gate! But it's barely visible. The issue is that the gate at Y=8 is at the very top edge of the viewport and as the ball falls (camera follows), the gate moves above the viewport before the ball reaches it.

## Fix
- First gate should spawn closer: at Y=6 instead of Y=8
- Camera needs to show more of the upper area (increase cameraOffsetY or adjust FOV)
- The viewport should show gates that are ~6-8 units above the ball
