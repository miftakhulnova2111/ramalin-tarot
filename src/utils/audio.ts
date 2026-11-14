// Audio Manager for Ramalin Tarot
// Uses real high-quality open-source ambient audio for BGM + Web Audio for crisp UI SFX

class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private isBgmPlaying = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Automatically start real atmospheric BGM on first user touch
  public startBGM() {
    this.initContext();
    if (typeof window === 'undefined') return;

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/audio/tarot-bgm.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.32;
    }

    if (!this.isBgmPlaying) {
      this.bgmAudio.play().then(() => {
        this.isBgmPlaying = true;
      }).catch((e) => {
        console.warn('Audio play deferred:', e);
      });
    }
  }

  public stopBGM() {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
      this.isBgmPlaying = false;
    }
  }

  public toggleBGM(): boolean {
    if (this.isBgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public isMuted(): boolean {
    return !this.isBgmPlaying;
  }

  // SFX: Card Swoop / Whoosh
  public playCardWhoosh() {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.35);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }

  // SFX: Golden Chime when card lands in slot
  public playCardChime() {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Golden bell pentatonic frequencies (G#5, C#6)
      [830.6, 1108.7].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.65);
      });
    } catch {}
  }

  // SFX: Evil Chuckle / Laugh when "Ambil Kartumu" is triggered
  public playEvilChuckle() {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // 3 descending sinister laugh pulses: "He-he-he"
      const laughPitches = [340, 310, 260];
      laughPitches.forEach((pitch, i) => {
        if (!this.ctx) return;
        const startTime = now + i * 0.14;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(pitch, startTime);
        osc.frequency.exponentialRampToValueAtTime(pitch * 0.75, startTime + 0.11);

        // Low-pass to soften the harshness into a raspy mystic chuckle
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.13);
      });
    } catch {}
  }

  // SFX: Mystic 3D Reveal Bell
  public playRevealChime(index = 0) {
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Higher resonant pitch per card (Past: 554Hz, Present: 659Hz, Future: 880Hz)
      const root = index === 0 ? 554.3 : index === 1 ? 659.2 : 880.0;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(root, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.95);
    } catch {}
  }
}

export const audioManager = new AudioManager();
