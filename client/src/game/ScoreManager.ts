// ScoreManager.ts — Score tracking, combo/multiplier, high score
// Score increments +1 per pass, multiplier = combo + 1 (base 1x).
// Multiplier resets to 1 on crash. High score saved to localStorage.

const HIGH_SCORE_KEY = "colorSwitchRush_highScore";

export class ScoreManager {
  private score: number = 0;
  private combo: number = 0;
  private highScore: number = 0;
  private onScoreChange: ((score: number, combo: number, multiplier: number) => void) | null = null;
  private onGameOver: ((finalScore: number, multiplier: number, isHighScore: boolean) => void) | null = null;

  constructor() {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
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

  saveHighScore(): void {
    localStorage.setItem(HIGH_SCORE_KEY, this.highScore.toString());
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
