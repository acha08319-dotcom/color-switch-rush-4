# Memory 17 — Gate Spawn Logic Bug

When no gates exist yet, the fallback for highestGateY is 8.
The spawn condition is: `while (this.nextSpawnY < highestGateY + this.gateSpacing && this.nextSpawnY < 20)`
With nextSpawnY = 15, highestGateY = 8, gateSpacing = 6:
15 < 14 → FALSE → no gates spawn.

The fix: the first gate should spawn immediately on beginGame, OR the spawn condition should use a larger upper bound. Since nextSpawnY is 15 (the initial spawn position), the first gate should be created during construction or immediately after.

Actually, looking at the GateManager constructor, it sets nextSpawnY = startSpawnY (15) but doesn't spawn any gates. The update loop is supposed to spawn them, but the condition prevents it.

Fix: Change the spawn logic to always spawn at least one gate, or change the condition to allow spawning above a reasonable threshold.
