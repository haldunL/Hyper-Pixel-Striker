// 16-Bit Arcade Chiptune & FM-Synthesizer Audio Engine
import { StageId } from '../types/game';

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentStage: StageId | 'menu' | null = null;
  private musicInterval: any = null;
  private stepIndex: number = 0;
  private tempoBpm: number = 132;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.35;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.55;

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  }

  public resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- SOUND EFFECTS (SFX) ---
  public playHit(heavy: boolean = false, blocked: boolean = false) {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    if (blocked) {
      // Metallic block deflection sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.12);
      return;
    }

    if (heavy) {
      // Deep heavy punch/kick crunch
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const noiseGain = this.ctx.createGain();
      const oscGain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.2);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(90, t);
      osc2.frequency.exponentialRampToValueAtTime(20, t + 0.25);

      oscGain.gain.setValueAtTime(0.7, t);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

      // Noise punch
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noiseGain.gain.setValueAtTime(0.5, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(oscGain);
      osc2.connect(oscGain);
      noise.connect(noiseGain);
      oscGain.connect(this.sfxGain);
      noiseGain.connect(this.sfxGain);

      osc.start(t);
      osc2.start(t);
      noise.start(t);
      osc.stop(t + 0.25);
      osc2.stop(t + 0.25);
      noise.stop(t + 0.08);
    } else {
      // Light attack snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.09);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.09);
    }
  }

  public playWhiff() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.1);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playFireballCast(color: 'red' | 'green' = 'red') {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = color === 'red' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.18);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.3);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  public playFireballExplosion() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Noise explosion
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(t);
    noise.stop(t + 0.35);
  }

  public playSpecialVoice(moveName: string) {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // 16-bit arcade vocal synth shout
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc2.type = 'sawtooth';

    const baseFreq = moveName.includes('Dragon') || moveName.includes('Uppercut') ? 220 : 330;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, t + 0.35);

    osc2.frequency.setValueAtTime(baseFreq * 1.01, t);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 1.81, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.4);
    osc2.stop(t + 0.4);
  }

  public playAnnouncer(text: 'round1' | 'round2' | 'finalround' | 'fight' | 'ko' | 'youwin') {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc2.type = 'triangle';

    let f1 = 150;
    let f2 = 220;
    let dur = 0.45;

    if (text === 'fight') {
      f1 = 140;
      f2 = 380;
      dur = 0.5;
    } else if (text === 'ko') {
      f1 = 280;
      f2 = 90;
      dur = 0.75;
    } else if (text === 'youwin') {
      f1 = 220;
      f2 = 440;
      dur = 0.6;
    }

    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(f2, t + dur * 0.7);

    osc2.frequency.setValueAtTime(f1 * 0.75, t);
    osc2.frequency.exponentialRampToValueAtTime(f2 * 0.75, t + dur * 0.7);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + dur);
    osc2.stop(t + dur);
  }

  public playSelectSound() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(880, t + 0.05);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playCursorSound() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, t);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  // --- 16-BIT RETRO MUSIC SEQUENCER ---
  public startStageMusic(stage: StageId | 'menu') {
    this.resume();
    if (this.currentStage === stage && this.musicInterval) return;
    this.stopMusic();
    this.currentStage = stage;
    this.stepIndex = 0;

    // Define stage specific tempo and scales
    let intervalMs = 125; // default 120 bpm (16th notes)
    if (stage === 'gym') intervalMs = 110;
    if (stage === 'ring') intervalMs = 115;
    if (stage === 'alley') intervalMs = 130;
    if (stage === 'park') intervalMs = 120;
    if (stage === 'throne') intervalMs = 112; // Menacing Boss BPM
    if (stage === 'menu') intervalMs = 140;

    this.musicInterval = setInterval(() => {
      this.tickMusicStep(stage);
      this.stepIndex = (this.stepIndex + 1) % 32;
    }, intervalMs);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentStage = null;
  }

  private playTone(freq: number, type: OscillatorType, dur: number, vol: number = 0.15) {
    if (!this.ctx || !this.musicGain || this.isMuted || freq <= 0) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  private playBass(freq: number, dur: number = 0.18, vol: number = 0.3) {
    this.playTone(freq, 'sawtooth', dur, vol);
    this.playTone(freq * 0.5, 'triangle', dur, vol * 1.2);
  }

  private playDrumKick() {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  private playDrumSnare() {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.09;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    noise.connect(gain);
    gain.connect(this.musicGain);
    noise.start(t);
    noise.stop(t + 0.09);
  }

  private playHiHat() {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(3500 + Math.random() * 500, t);
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 0.03);
  }

  private tickMusicStep(stage: StageId | 'menu') {
    const step = this.stepIndex;

    // Standard drum groove on 16 steps
    if (step % 4 === 0) {
      this.playDrumKick();
    } else if (step % 4 === 2) {
      this.playDrumSnare();
    }
    if (step % 2 === 1) {
      this.playHiHat();
    }

    if (stage === 'menu') {
      // Smooth funky arcade title / select theme
      const chords = [220, 261.6, 329.6, 392]; // Am7
      const lead = [440, 0, 523.2, 587.3, 659.2, 0, 587.3, 523.2, 440, 392, 440, 0, 523.2, 659.2, 784, 659.2];
      const bassFreq = (step < 16) ? 110 : 98; // A -> G
      if (step % 2 === 0) {
        this.playBass(bassFreq, 0.16, 0.25);
      }
      const note = lead[step % 16];
      if (note > 0) {
        this.playTone(note, 'square', 0.14, 0.12);
      }
    } else if (stage === 'park') {
      // Cherry Park: Heroic, uplifting Street Fighter style theme
      const parkBass = [130.8, 130.8, 164.8, 130.8, 174.6, 174.6, 196, 174.6]; // C -> E -> F -> G
      const parkLead = [
        523.25, 0, 587.33, 659.25, 0, 783.99, 659.25, 0,
        587.33, 523.25, 0, 440, 493.88, 523.25, 587.33, 0,
        659.25, 0, 783.99, 880, 0, 783.99, 659.25, 587.33,
        523.25, 659.25, 587.33, 0, 523.25, 0, 0, 0
      ];
      this.playBass(parkBass[Math.floor(step / 4) % 8], 0.2, 0.28);
      const note = parkLead[step];
      if (note > 0) {
        this.playTone(note, 'square', 0.18, 0.16);
        this.playTone(note * 0.5, 'triangle', 0.18, 0.12);
      }
    } else if (stage === 'alley') {
      // Back Alley: Gritty 90s Streets of Rage funk-synth
      const alleyBass = [98, 98, 116.5, 98, 130.8, 98, 146.8, 130.8]; // G minor funk
      const alleyLead = [
        392, 0, 466.16, 0, 523.25, 0, 587.33, 0,
        466.16, 392, 0, 349.23, 392, 0, 466.16, 523.25,
        587.33, 0, 698.46, 587.33, 0, 466.16, 392, 0,
        349.23, 392, 466.16, 0, 392, 0, 0, 0
      ];
      if (step % 2 === 0) {
        this.playBass(alleyBass[Math.floor(step / 4) % 8], 0.15, 0.32);
      }
      const note = alleyLead[step];
      if (note > 0) {
        this.playTone(note, 'sawtooth', 0.15, 0.14);
      }
    } else if (stage === 'gym') {
      // Gym: Fast training montage synthwave with aggressive 16th-note rhythm
      const gymBass = [110, 110, 110, 110, 130.8, 130.8, 146.8, 146.8];
      const gymLead = [
        440, 440, 523.25, 440, 587.33, 440, 659.25, 587.33,
        523.25, 440, 523.25, 587.33, 659.25, 0, 783.99, 659.25,
        880, 0, 783.99, 659.25, 587.33, 659.25, 523.25, 440,
        523.25, 587.33, 659.25, 783.99, 880, 0, 0, 0
      ];
      this.playBass(gymBass[Math.floor(step / 4) % 8], 0.12, 0.3);
      const note = gymLead[step];
      if (note > 0) {
        this.playTone(note, 'square', 0.12, 0.15);
      }
    } else if (stage === 'ring') {
      // Boxing Ring: Dramatic high-stakes championship battle
      const ringBass = [87.3, 87.3, 98, 98, 110, 110, 130.8, 110]; // F -> G -> A -> C
      const ringLead = [
        349.23, 0, 440, 0, 523.25, 0, 659.25, 0,
        587.33, 523.25, 440, 0, 392, 440, 523.25, 0,
        659.25, 0, 783.99, 0, 880, 783.99, 659.25, 0,
        587.33, 523.25, 440, 523.25, 440, 0, 0, 0
      ];
      this.playBass(ringBass[Math.floor(step / 4) % 8], 0.22, 0.35);
      const note = ringLead[step];
      if (note > 0) {
        this.playTone(note, 'sawtooth', 0.2, 0.17);
        this.playTone(note * 1.5, 'square', 0.1, 0.08);
      }
    } else if (stage === 'throne') {
      // Throne Citadel: Dark Gothic Boss Synth (Lord Raizen theme in D-minor)
      const bossBass = [73.42, 73.42, 69.3, 73.42, 77.78, 73.42, 87.31, 82.41]; // D -> C# -> D -> Eb -> D -> F -> E
      const bossLead = [
        293.66, 0, 349.23, 0, 440.0, 0, 415.3, 0,
        349.23, 293.66, 0, 261.63, 293.66, 349.23, 440.0, 523.25,
        587.33, 0, 523.25, 0, 493.88, 0, 440.0, 415.3,
        440.0, 349.23, 293.66, 261.63, 293.66, 0, 0, 0
      ];
      this.playBass(bossBass[Math.floor(step / 4) % 8], 0.25, 0.4);
      const note = bossLead[step];
      if (note > 0) {
        this.playTone(note, 'sawtooth', 0.22, 0.2);
        this.playTone(note * 0.5, 'triangle', 0.25, 0.15);
      }
    }
  }
}

export const audio = new RetroAudioEngine();
