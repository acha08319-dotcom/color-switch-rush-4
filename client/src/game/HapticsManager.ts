// HapticsManager.ts — Optional, user-controlled vibration feedback for mobile play.
// Kinetic Arcade Tunnel reminder: haptics are a quiet confirmation layer, never a requirement.

import { readLocal, writeLocal } from "./StorageAdapter";

const HAPTICS_KEY = "colorSwitchRush_hapticsEnabled";

type HapticPattern = "cycle" | "pass" | "crash" | "rush";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  cycle: 8,
  pass: 12,
  crash: [35, 24, 70],
  rush: [18, 24, 18],
};

export class HapticsManager {
  private enabled: boolean;

  constructor() {
    this.enabled = readLocal(HAPTICS_KEY) === "true";
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    writeLocal(HAPTICS_KEY, enabled ? "true" : "false");
  }

  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  pulse(pattern: HapticPattern): void {
    if (!this.enabled || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    try {
      navigator.vibrate(PATTERNS[pattern]);
    } catch {
      // Vibration is optional and can be blocked by a browser or host.
    }
  }
}
