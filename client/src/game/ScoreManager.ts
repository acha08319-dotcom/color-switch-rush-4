// ScoreManager.ts — Score tracking, combo/multiplier, high score
// Persists shared score state through YouTube Playables when available.

import { YtGameAdapter, type PlayablesSaveData } from "./YtGameAdapter";
import { readLocal, writeLocal } from "./StorageAdapter";
// Score increments +1 per pass, multiplier = combo + 1 (base 1x).
// Multiplier resets to 1 on crash. High score saved to localStorage.

const HIGH_SCORE_KEY = "colorSwitchRush_highScore";

export class ScoreManager {
  private score: number = 0;
  private combo: number = 0;
  private highScore: number = 0;
  private lastSentHighScore = 0;
  private onScoreChange: ((score: number, combo: number, multiplier: number) => void) | null = null;
  private onGameOver: ((finalScore: number, multiplier: number, isHighScore: boolean) => void) | null = null;

  constructor() {
    const saved = readLocal(HIGH_SCORE_KEY);
    if (saved) {
      this.highScore = parseInt(saved, 10) || 0;
    }
  }

  getScore(): number {
    return this.score;
  }

  getCombo(): number {
    return this.combo;
  }

  getMultiplier(): number {
    return this.combo + 1;
  }

  getHighScore(): number {
    return this.highScore;
  }

  async loadFromPlayables(): Promise<void> {
    const raw = await YtGameAdapter.loadSaveData();
    if (!raw) return;

    try {
      const saved = JSON.parse(raw) as Partial<PlayablesSaveData>;
      if (typeof saved.highScore === "number" && Number.isFinite(saved.highScore)) {
        this.highScore = Math.max(this.highScore, Math.floor(saved.highScore));
        this.lastSentHighScore = this.highScore;
        writeLocal(HIGH_SCORE_KEY, this.highScore.toString());
      }
    } catch (error) {
      console.warn("Saved score data could not be parsed", error);
      YtGameAdapter.logWarning();
    }
  }

  saveHighScore(): void {
    writeLocal(HIGH_SCORE_KEY, this.highScore.toString());
    void YtGameAdapter.mergeSaveData({ highScore: this.highScore });
    if (this.highScore > this.lastSentHighScore) {
      this.lastSentHighScore = this.highScore;
      void YtGameAdapter.sendScore(this.highScore);
    }
  }

  getElapsed(): number {
    return this.score; // Use score as a proxy for elapsed time
  }

  onScoreChangeUpdate(fn: (score: number, combo: number, multiplier: number) => void): void {
    this.onScoreChange = fn;
  }

  onGameOverUpdate(fn: (finalScore: number, multiplier: number, isHighScore: boolean) => void): void {
    this.onGameOver = fn;
  }

  pass(): void {
    this.score++;
    this.combo++;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
    this.emitScoreChange();
  }

  crash(): void {
    const finalScore = this.score;
    const finalMultiplier = this.getMultiplier();
    const isHighScore = this.score >= this.highScore;
    this.onGameOver?.(finalScore, finalMultiplier, isHighScore);
    this.combo = 0;
    this.emitScoreChange();
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.emitScoreChange();
  }

  private emitScoreChange(): void {
    this.onScoreChange?.(this.score, this.combo, this.getMultiplier());
  }
}
