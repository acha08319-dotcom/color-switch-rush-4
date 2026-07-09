// types.ts — Shared types for Color Switch Rush
// Design: 6-color palette, 6-segment gates, 60° per segment

import { Color3 } from "@babylonjs/core/Maths/math.color";

export const COLORS = [
  { name: "red",    hex: "#FF3B3B", color3: new Color3(1, 0.23, 0.23) },
  { name: "orange", hex: "#FF9F1C", color3: new Color3(1, 0.62, 0.11) },
  { name: "yellow", hex: "#FFD60A", color3: new Color3(1, 0.84, 0.04) },
  { name: "green",  hex: "#2EC4B6", color3: new Color3(0.18, 0.77, 0.71) },
  { name: "cyan",   hex: "#00B4D8", color3: new Color3(0, 0.71, 0.85) },
  { name: "purple", hex: "#9B5DE5", color3: new Color3(0.61, 0.37, 0.90) },
] as const;

export type ColorIndex = 0 | 1 | 2 | 3 | 4 | 5;
export type GamePhase = "menu" | "playing" | "gameOver";

export interface GameState {
  phase: GamePhase;
  score: number;
  combo: number;
  multiplier: number;
  highScore: number;
}

export interface GateConfig {
  y: number;           // vertical position
  segments: ColorIndex[]; // 6 segment colors in clockwise order (segment 0 at top)
  rotationAngle: number;  // current rotation in radians (0 = segment 0 at top)
}
