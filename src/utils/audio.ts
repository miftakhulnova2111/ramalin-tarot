// Audio Manager for Ramalin Tarot
// 100% Real High-Fidelity Acoustic Card Foley + Web Audio Zero-Latency Decoding

class AudioManager {
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private isBgmPlaying = false;

  // AudioBuffer cache for instant zero-latency concurrent playback
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

  // Preload and decode pristine audio buffers
  private async preloadSFX() {
    this.isPreloaded = true;
    const sfxList = [
      { name: 'shuffle', url: '/audio/card-shuffle.mp3' },
      { name: 'slide', url: '/audio/card-slide.mp3' },
      { name: 'snap', url: '/audio/card-snap.mp3' },
      { name: 'flip', url: '/audio/card-flip.mp3' },
    ];

    for (const item of sfxList) {
      // 1. Fallback HTMLAudioElement pool
      const pool = [new Audio(item.url), new Audio(item.url), new Audio(item.url)];
      pool.forEach((a) => {
        a.preload = 'auto';
      });
      this.audioElements.set(item.name, pool);

      // 2. Decode Web Audio Buffer for instant playback
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

  // Pure buffer playback with subtle organic pitch variation (NO oscillator beeps)
  private playBuffer(name: string, volume = 0.9, pitchVar = 0.05) {
    this.initContext();

    const buffer = this.audioBuffers.get(name);
    if (this.ctx && buffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

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

  // Real atmospheric BGM
  public startBGM() {
    this.initContext();
    if (typeof window === 'undefined') return;

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio('/audio/tarot-bgm.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.32;
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
    this.playBuffer('shuffle', 0.95, 0.04);
  }

  // SFX 2: Real Crisp Card Draw / Slide on felt
  public playCardSlide() {
    this.playBuffer('slide', 0.95, 0.06);
  }

  // SFX 3: Heavy Punchy Card Snap / Impact on Table
  public playCardSnap() {
    this.playBuffer('snap', 1.0, 0.05);
  }

  // SFX 4: Crisp Card Flip / Turn
  public playCardFlip() {
    this.playBuffer('flip', 0.95, 0.05);
  }

  // Aliases for seamless component compatibility
  public playCardWhoosh() {
    this.playCardSlide();
  }

  public playCardChime() {
    this.playCardSnap();
  }

  public playRevealChime(_index = 0) {
    this.playCardSnap();
  }

  public playEvilChuckle() {
    this.playCardSlide();
  }

  public play(name: string) {
    if (name === 'shuffle') this.playCardShuffle();
    else if (name === 'slide' || name === 'whoosh') this.playCardSlide();
    else if (name === 'flip') this.playCardFlip();
    else this.playCardSnap();
  }
}

export const audioManager = new AudioManager();
