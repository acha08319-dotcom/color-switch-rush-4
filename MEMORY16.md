# Memory 16 — Collision Fires Too Early

The game crashes immediately (score 0) because:
1. First gate spawns at Y=8 (ballY + 8)
2. Scroll speed starts at 5 units/sec
3. Delta time ~0.016s → gate moves 0.08 units per frame
4. Ball at Y=0, gate at Y=8 → takes ~1.6 seconds to reach ball
5. But the collision happened after only ~0.2 seconds

Wait, looking at the debug data: gate was at Y=0.068 when it crashed. That means the gate scrolled from Y=8 to Y=0.068 in about 1.6 seconds. The ball was at Y=0. The collision epsilon is 0.3, and the gate was at 0.068 which is within epsilon of ballY=0. So the collision fired correctly.

The issue is that the ball color (red, index 0) didn't match the front segment color. Let me check: the gate rotation was 171 degrees. Segment 2 is at front at rotation 0. At rotation 171°, front segment = (2 - round(171/60)) % 6 = (2 - 3) % 6 = 5. So the front segment color was whatever color 5 was assigned (purple). Ball was red (color 0). Red ≠ purple → crash.

This is correct behavior! The player didn't have time to cycle the color. The game is working correctly.

But the initial spawn should give the player more time. Let me increase the initial gate spawn distance to 12 or 15, and reduce the initial scroll speed.
