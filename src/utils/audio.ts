// Audio Manager for Ramalin Tarot
// Real high-fidelity acoustic card samples + Web Audio API zero-latency buffer playback

class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private isBgmPlaying = false;

  // AudioBuffer cache for zero-latency, concurrent SFX playback
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private audioElements: Map<string, HTMLAudioElement[]> = new Map();
  private isPreloaded = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.isPreloaded && typeof window !== 'undefined') {
      this.preloadSFX();
    }
  }

  // Preload and decode audio buffers
  private async preloadSFX() {
    this.isPreloaded = true;
    const sfxList = [
      { name: 'shuffle', url: '/audio/card-shuffle.mp3' },
      { name: 'slide', url: '/audio/card-slide.mp3' },
      { name: 'flip', url: '/audio/card-flip.mp3' },
    ];

    for (const item of sfxList) {
      // 1. Create fallback HTMLAudioElement pool
      const pool = [new Audio(item.url), new Audio(item.url), new Audio(item.url)];
      pool.forEach((a) => {
        a.preload = 'auto';
      });
      this.audioElements.set(item.name, pool);

      // 2. Decode AudioBuffer for Web Audio API
      if (this.ctx) {
        try {
          const res = await fetch(item.url);
          const arrayBuf = await res.arrayBuffer();
          const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
          this.audioBuffers.set(item.name, audioBuf);
        } catch (e) {
          console.warn(`Could not decode audio buffer for ${item.name}:`, e);
        }
      }
    }
  }

  // Generic buffer player with volume and random pitch variation
  private playBuffer(name: string, volume = 0.8, pitchVar = 0.05) {
    this.initContext();

    const buffer = this.audioBuffers.get(name);
    if (this.ctx && buffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        // Subtle organic pitch variation
        if (pitchVar > 0) {
          const detune = (Math.random() * 2 - 1) * (pitchVar * 1200);
          source.detune.setValueAtTime(detune, this.ctx.currentTime);
        }

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (e) {
        console.warn('Web Audio buffer playback error:', e);
      }
    }

    // Fallback to HTMLAudioElement pool
    const pool = this.audioElements.get(name);
    if (pool && pool.length > 0) {
      const audio = pool.find((a) => a.paused) || pool[0];
      audio.volume = volume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  // Automatically start real atmospheric BGM on first user touch
  public startBGM() {
    this.initContext();
    if (typeof window === 'undefined') return;

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/audio/tarot-bgm.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.35;
    }

    if (!this.isBgmPlaying) {
      this.bgmAudio
        .play()
        .then(() => {
          this.isBgmPlaying = true;
        })
        .catch((e) => {
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

  // SFX 1: Real Riffle Card Shuffle
  public playCardShuffle() {
    this.playBuffer('shuffle', 0.85, 0.03);
  }

  // SFX 2: Real Crisp Card Draw / Slide
  public playCardSlide() {
    this.playBuffer('slide', 0.95, 0.08);
  }

  // Backward compatible alias
  public playCardWhoosh() {
    this.playCardSlide();
  }

  // SFX 3: Crisp Card Snap / Lock when docking into slot
  public playCardChime() {
    // 1. Crisp physical snap
    this.playBuffer('flip', 0.75, 0.05);

    // 2. Harmonious subtle golden chime
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [830.6, 1108.7].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.06, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.5);
      });
    } catch {}
  }

  // SFX 4: Real Crisp Card Flip + Resonant Mystic Bell per card
  public playRevealChime(index = 0) {
    // 1. Crisp physical card flip
    this.playBuffer('flip', 0.9, 0.04);

    // 2. Resonant mystic chime (Past: 554Hz, Present: 659Hz, Future: 880Hz)
    this.initContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const root = index === 0 ? 554.3 : index === 1 ? 659.2 : 880.0;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(root, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch {}
  }

  // Backward compatible alias - gentle mystical whoosh instead of harsh oscillator
  public playEvilChuckle() {
    this.playCardSlide();
  }
}

export const audioManager = new AudioManager();
