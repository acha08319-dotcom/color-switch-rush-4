# Memory 6 — Critical Bug: Gates Fall at Same Speed as Ball

## The fundamental issue
The ball falls at fallSpeed=5/sec. The gates also fall at fallSpeedDelta=5*delta per frame. This means the gate and ball maintain the SAME distance forever! The gate was at Y=6, ball at Y=0. Both fall at 5/sec. After 10 seconds, gate is at Y=-44, ball at Y=-50. Distance remains 6 units.

The collision epsilon is 0.15, so the ball never gets within range of the gate.

## The fix
The gates should NOT fall at the same speed as the ball. Instead, the gates should be STATIC (or fall much slower) while the ball falls toward them. The camera follows the ball, so the gates appear to move down through the viewport.

Actually, the correct approach is:
- Ball falls downward at fallSpeed
- Gates are STATIC (they don't move)
- Camera follows the ball downward
- As camera moves down, gates appear to move up through the viewport
- New gates spawn above the camera view

This way the ball approaches each gate and eventually passes through it.
