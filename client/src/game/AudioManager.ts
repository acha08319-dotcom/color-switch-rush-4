// AudioManager.ts — Web Audio API sound effects for Color Switch Rush
// Generates all sounds procedurally using oscillators and noise.
// Sounds: pass (ascending ping), crash (low thud), colorCycle (soft click),
//         warningBeep (urgent tone before gate arrival), comboRise (rising pitch).

export class AudioManager {
  private ctx: AudioContext | null = null;

  /** Lazily initialize the AudioContext (must be triggered by user gesture) */
  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Initialize audio on first user interaction */
  init(): void {
    this.ensureContext();
  }

  /** Play a satisfying ascending ping for a successful pass */
  playPass(multiplier: number = 1): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // Base frequency rises with multiplier
    const baseFreq = 440 + (multiplier - 1) * 60;

    // Main tone — short ascending sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // Harmonic sparkle — octave above
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(baseFreq * 2, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.15);
    gain2.gain.setValueAtTime(0.08, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.2);
  }

  /** Play a low thud/crash sound */
  playCrash(): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // Low rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // Noise burst for impact
    const bufferSize = ctx.sampleRate * 0.2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.3);
  }

  /** Play a soft click for color cycling */
  playColorCycle(): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /** Play a rising pitch tone when combo increases */
  playComboRise(comboLevel: number): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // Higher pitch for higher combo
    const startFreq = 300 + comboLevel * 100;
    const endFreq = startFreq + 200 + comboLevel * 50;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.15);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.setValueAtTime(0.12, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    // If combo >= 3, add a sparkle
    if (comboLevel >= 3) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(endFreq * 1.5, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(endFreq * 2, now + 0.15);
      gain2.gain.setValueAtTime(0.06, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.18);
    }

    // If combo >= 5, add a third harmonic
    if (comboLevel >= 5) {
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(endFreq * 2, now + 0.08);
      osc3.frequency.exponentialRampToValueAtTime(endFreq * 3, now + 0.18);
      gain3.gain.setValueAtTime(0.04, now + 0.08);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc3.connect(gain3).connect(ctx.destination);
      osc3.start(now + 0.08);
      osc3.stop(now + 0.22);
    }
  }

  /** Play an urgent warning beep before a gate arrives */
  playWarning(): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // Two quick beeps
    for (let i = 0; i < 2; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      const startT = now + i * 0.12;
      osc.frequency.setValueAtTime(520, startT);
      osc.frequency.exponentialRampToValueAtTime(440, startT + 0.08);
      gain.gain.setValueAtTime(0.08, startT);
      gain.gain.setValueAtTime(0.08, startT + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.1);

      osc.connect(gain).connect(ctx.destination);
      osc.start(startT);
      osc.stop(startT + 0.1);
    }
  }

  dispose(): void {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
