# Memory 21 — Collision Always Crashes

The game crashed again with score 0. The ball was at cyan (0.00, 0.71, 0.85) which is index 3. The closest gate was at Y=0.21 with rotation 9.82 radians.

The CollisionDetector calculates frontSegment = ((2 - Math.round(normalizedRot / 60)) % 6 + 6) % 6.
With rotation 9.82 radians = 562.6 degrees, normalized to (562.6 % 360) = 202.6 degrees.
frontSegment = ((2 - Math.round(202.6/60)) % 6 + 6) % 6 = ((2 - 3) % 6 + 6) % 6 = 5.

So the front segment color index is segmentColors[5]. Since segmentColors is a random shuffle of [0,1,2,3,4,5], the chance of segmentColors[5] being 3 (cyan) is 1/6.

This is correct. The game IS working. It's just hard to match.

But wait - there's a problem. The CollisionDetector is being called every frame for EVERY gate. When the ball is within epsilon of a gate, it checks the collision. But the gate is scrolling down continuously, so the ball might be within epsilon for multiple frames. The checkedGates WeakSet prevents re-checking the same gate, so the first check result is the one that counts.

This means the collision is determined by the ball color at the EXACT moment the ball enters the epsilon zone of the gate. If the ball color changes AFTER entering the epsilon zone, it won't matter.

This is a design issue. The player should be able to match the color up until the moment of collision. The current implementation locks in the color as soon as the ball enters the epsilon zone.

This needs to be fixed. The collision should be checked continuously, not just once. Or the epsilon should be smaller and the check should happen at the exact moment of crossing.

Actually, looking at the code more carefully: the WeakSet prevents re-checking, so the FIRST frame where distanceY < epsilon is when the collision is determined. This means the player has about epsilon/scrollSpeed seconds to match. With epsilon=0.3 and speed=3, that's 0.1 seconds - way too fast!

Fix: The collision should be determined when the gate baseY crosses the ballY (passes through), not when the ball enters epsilon. We need to track whether the gate has already been checked, and only determine pass/crash when the gate actually crosses the ball's Y position.
