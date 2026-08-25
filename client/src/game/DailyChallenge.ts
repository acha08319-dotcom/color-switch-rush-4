// DailyChallenge.ts — Manages daily challenge mode with fixed seed
// Players compete on the same gate sequence every day.
// Tracks daily best score separately from all-time high score.

import { SeededRandom } from "./SeededRandom";
import { YtGameAdapter, type PlayablesSaveData } from "./YtGameAdapter";
import { readLocal, writeLocal } from "./StorageAdapter";

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
    const savedDate = readLocal(DAILY_DATE_KEY);
    if (savedDate !== this.dateStamp) {
      writeLocal(DAILY_DATE_KEY, this.dateStamp);
      writeLocal(DAILY_BEST_KEY, "0");
      return 0;
    }
    const saved = readLocal(DAILY_BEST_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  }

  async loadFromPlayables(): Promise<void> {
    const raw = await YtGameAdapter.loadSaveData();
    if (!raw) return;

    try {
      const saved = JSON.parse(raw) as Partial<PlayablesSaveData>;
      if (saved.dailyDate === this.dateStamp && typeof saved.dailyBest === "number" && Number.isFinite(saved.dailyBest)) {
        this.dailyBest = Math.max(this.dailyBest, Math.floor(saved.dailyBest));
      } else if (saved.dailyDate && saved.dailyDate !== this.dateStamp) {
        this.dailyBest = 0;
      }

      writeLocal(DAILY_DATE_KEY, this.dateStamp);
      writeLocal(DAILY_BEST_KEY, this.dailyBest.toString());
    } catch (error) {
      console.warn("Saved daily challenge data could not be parsed", error);
      YtGameAdapter.logWarning();
    }
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
      writeLocal(DAILY_BEST_KEY, score.toString());
      void YtGameAdapter.mergeSaveData({ dailyBest: score, dailyDate: this.dateStamp });
      return true;
    }
    return false;
  }
}
