// DailyChallenge.ts — Manages daily challenge mode with fixed seed
// Players compete on the same gate sequence every day.
// Tracks daily best score separately from all-time high score.

import { SeededRandom } from "./SeededRandom";

const DAILY_BEST_KEY = "colorSwitchRush_dailyBest";
const DAILY_DATE_KEY = "colorSwitchRush_dailyDate";

export class DailyChallenge {
  private dateStamp: string;
  private dailyBest: number;

  constructor() {
    this.dateStamp = this.getDateStamp();
    this.dailyBest = this.loadDailyBest();
  }

  private getDateStamp(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }

  private loadDailyBest(): number {
    const savedDate = localStorage.getItem(DAILY_DATE_KEY);
    if (savedDate !== this.dateStamp) {
      localStorage.setItem(DAILY_DATE_KEY, this.dateStamp);
      localStorage.setItem(DAILY_BEST_KEY, "0");
      return 0;
    }
    const saved = localStorage.getItem(DAILY_BEST_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  }

  getRNG(): SeededRandom {
    return new SeededRandom(SeededRandom.getDailySeed());
  }

  getDailyBest(): number {
    return this.dailyBest;
  }

  updateDailyBest(score: number): boolean {
    if (score > this.dailyBest) {
      this.dailyBest = score;
      localStorage.setItem(DAILY_BEST_KEY, score.toString());
      return true;
    }
    return false;
  }
}
