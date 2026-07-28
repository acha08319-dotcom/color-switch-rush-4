// SeededRandom.ts — Deterministic pseudo-random number generator
// Used for Daily Challenge mode so every player gets the same gate sequence per day.
// Based on mulberry32 — fast, good distribution, suitable for game use.

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /** Generate next random number in [0, 1) */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Random integer in [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Shuffle an array in place using Fisher-Yates */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /** Get a date-based seed: YYYYMMDD as a number */
  static getDailySeed(date: Date = new Date()): number {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return y * 10000 + m * 100 + d;
  }
}
