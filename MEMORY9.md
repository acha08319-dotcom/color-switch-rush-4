# Memory 9 — Root Cause Analysis: Gates Invisible

## Key findings
1. Gates are created at Y=10, Z=0, with radius 2.2 and tube radius 0.22
2. Camera at (0,5,-15), FOV=1.3, looking at (0,2,0)
3. Gate rings use emissiveColor which should be bright
4. Ball is clearly visible (red sphere at center)

## The problem
With camera at Z=-15, FOV=1.3:
- Vertical FOV ≈ 1.3 radians ≈ 74°
- At distance 15, vertical coverage ≈ 2 * 15 * tan(0.65) ≈ 22.7 units
- Camera at Y=5, so visible Y range ≈ 5 ± 11.3 = [-6.3, 16.3]
- Gate at Y=10 should be in the upper portion of the viewport
- Gate at Z=0, camera at Z=-15, distance = 15

The gate SHOULD be visible. The ring has radius 2.2 and tube radius 0.22.
At distance 15, a 4.4-unit diameter ring would appear as ~17° of the FOV, which is clearly visible.

## Why it's not visible
Possibilities:
1. The emissiveColor might not be rendering correctly with the dark background
2. The gate segments might be clipped by the near plane
3. The gate mesh might be at a different position than expected

## Debug: Add console.log to verify
Add logging to GateManager.createGate to confirm gates are being created.
Also add a simple visible sphere at gate positions to verify visibility.

## Alternative: Make gates MORE visible
- Increase tube radius from 0.22 to 0.35
- Increase emissive brightness
- Add a brighter emissive value (scale up the color)
