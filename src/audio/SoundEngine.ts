// Procedural Web Audio API sound engine for LAST HORIZON

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private noiseNode: AudioNode | null = null;
  private isMuted: boolean = false;
  private initialized: boolean = false;

  public init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
    } catch {
      // AudioContext may be restricted until user interaction
    }
  }

  private resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.08, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Futuristic UI click
  public playUiClick() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Scanner Pulse Sound (F key)
  public playScanner() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Sweeping tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.6);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);

    // Filtered noise ping
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Jump / Jetpack thruster burst
  public playJetpack() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(900, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Footstep on terrain
  public playFootstep(running: boolean = false) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = 80 + Math.random() * 25;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    const vol = running ? 0.07 : 0.04;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Item pickup / resource gathered
  public playCollect() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);

      gain.gain.setValueAtTime(0.06, now + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.2);
    });
  }

  // Ship launch / atmospheric entry roar
  public playShipLaunch() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 1.2);
    filter.frequency.exponentialRampToValueAtTime(250, now + 2.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Hazard warning beep
  public playHazardWarning() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(370, now + 0.1);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Creature sound (alien chirp or roar)
  public playCreatureSound(isPredator: boolean) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isPredator) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.linearRampToValueAtTime(1100, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(550, now + 0.25);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Plasma blaster fire sound
  public playBlasterFire() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.14);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Player hurt / damaged sound
  public playPlayerHurt() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Heavy impact thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    this.playHazardWarning();
  }

  // Villain Alien Spot & Roar
  public playVillainRoar() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.8);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  }

  // Alien taking hit
  public playAlienHit() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Alien defeated
  public playAlienDefeated() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 1.2);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Weapon equip sound
  public playWeaponEquip() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [440, 660, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.08, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.15);
    });
  }

  // Planetary background drone
  public startAmbient(type: string = 'rocky') {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    this.stopAmbient();

    const now = this.ctx.currentTime;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06, now);

    this.ambientOsc1 = this.ctx.createOscillator();
    this.ambientOsc2 = this.ctx.createOscillator();

    const baseFreq = type === 'ice' ? 65 : type === 'toxic' ? 52 : type === 'volcanic' ? 44 : 58;
    this.ambientOsc1.type = 'sine';
    this.ambientOsc1.frequency.setValueAtTime(baseFreq, now);

    this.ambientOsc2.type = 'triangle';
    this.ambientOsc2.frequency.setValueAtTime(baseFreq * 1.5, now);

    this.ambientOsc1.connect(this.ambientGain);
    this.ambientOsc2.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    this.ambientOsc1.start(now);
    this.ambientOsc2.start(now);
  }

  // Tense Alien Encounter & Chase Music System
  private chaseActive: boolean = false;
  private chaseGain: GainNode | null = null;
  private chaseDroneOsc: OscillatorNode | null = null;
  private chaseDroneFilter: BiquadFilterNode | null = null;
  private chasePulseTimer: number | null = null;
  private chaseOstinatoTimer: number | null = null;
  private currentChaseDist: number = 999;
  private currentIsChasing: boolean = false;

  public startChaseMusic() {
    if (this.chaseActive) return;
    this.resume();
    if (!this.ctx) return;

    this.chaseActive = true;
    const now = this.ctx.currentTime;

    // Master chase gain node
    this.chaseGain = this.ctx.createGain();
    this.chaseGain.gain.setValueAtTime(0.001, now);
    this.chaseGain.gain.exponentialRampToValueAtTime(this.isMuted ? 0.001 : 0.16, now + 1.2);

    // Deep Menacing Low Drone (Sub-bass sawtooth through resonant lowpass)
    this.chaseDroneFilter = this.ctx.createBiquadFilter();
    this.chaseDroneFilter.type = 'lowpass';
    this.chaseDroneFilter.frequency.setValueAtTime(140, now);
    this.chaseDroneFilter.Q.setValueAtTime(6, now);

    this.chaseDroneOsc = this.ctx.createOscillator();
    this.chaseDroneOsc.type = 'sawtooth';
    this.chaseDroneOsc.frequency.setValueAtTime(46, now); // Low F#1 / F1 rumble

    this.chaseDroneOsc.connect(this.chaseDroneFilter);
    this.chaseDroneFilter.connect(this.chaseGain);
    this.chaseGain.connect(this.ctx.destination);
    this.chaseDroneOsc.start(now);

    // Schedule Heartbeat Pulse (lub-dub)
    const playHeartbeat = () => {
      if (!this.chaseActive || !this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const dist = this.currentChaseDist;

      // Heartbeat volume scales with closeness
      const beatVol = Math.min(0.24, Math.max(0.06, 0.24 - (dist / 40) * 0.18));

      // Lub (First thud)
      const osc1 = this.ctx.createOscillator();
      const g1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65, t);
      osc1.frequency.exponentialRampToValueAtTime(28, t + 0.09);
      g1.gain.setValueAtTime(beatVol, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc1.connect(g1);
      g1.connect(this.ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.09);

      // Dub (Second thud 110ms later)
      setTimeout(() => {
        if (!this.chaseActive || !this.ctx || this.isMuted) return;
        const t2 = this.ctx.currentTime;
        const osc2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(80, t2);
        osc2.frequency.exponentialRampToValueAtTime(32, t2 + 0.08);
        g2.gain.setValueAtTime(beatVol * 1.15, t2);
        g2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.08);
        osc2.connect(g2);
        g2.connect(this.ctx.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.08);
      }, 110);

      // Modulate heartbeat rate: 420ms (urgent 142 bpm) when close, 950ms (63 bpm) when medium
      const nextInterval = Math.max(380, Math.min(1050, dist * 22 + 350));
      this.chasePulseTimer = window.setTimeout(playHeartbeat, nextInterval);
    };

    playHeartbeat();

    // Schedule Tense Ostinato Synth Pulses (John Carpenter style ominous notes)
    let ostinatoStep = 0;
    const ostinatoNotes = [92.5, 98.0, 110.0, 87.3]; // F#2, G2, A2, F2
    const playOstinato = () => {
      if (!this.chaseActive || !this.ctx || this.isMuted) return;
      const t = this.ctx.currentTime;
      const dist = this.currentChaseDist;

      if (dist < 38) {
        const noteFreq = ostinatoNotes[ostinatoStep % ostinatoNotes.length];
        ostinatoStep++;

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(noteFreq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(dist < 18 ? 950 : 550, t);
        filter.Q.setValueAtTime(4, t);

        const ostVol = Math.min(0.12, Math.max(0.02, 0.12 - (dist / 40) * 0.1));
        gain.gain.setValueAtTime(ostVol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.18);
      }

      const ostInterval = this.currentIsChasing ? 200 : 320;
      this.chaseOstinatoTimer = window.setTimeout(playOstinato, ostInterval);
    };

    playOstinato();
  }

  // Update real-time intensity based on distance to villain and chase state
  public updateChaseMusic(distanceToVillain: number, isChasing: boolean) {
    this.currentChaseDist = distanceToVillain;
    this.currentIsChasing = isChasing;

    if (distanceToVillain < 42.0) {
      if (!this.chaseActive) {
        this.startChaseMusic();
      }
      if (this.ctx && this.chaseGain && this.chaseDroneFilter) {
        const now = this.ctx.currentTime;
        const targetVol = this.isMuted
          ? 0.001
          : Math.min(0.25, Math.max(0.04, 0.25 - (distanceToVillain / 42) * 0.18));
        this.chaseGain.gain.cancelScheduledValues(now);
        this.chaseGain.gain.linearRampToValueAtTime(targetVol, now + 0.2);

        // Modulate drone filter brightness
        const filterCutoff = Math.min(420, Math.max(100, 380 - distanceToVillain * 6));
        this.chaseDroneFilter.frequency.linearRampToValueAtTime(filterCutoff, now + 0.2);
      }
    } else {
      if (this.chaseActive) {
        this.stopChaseMusic();
      }
    }
  }

  public stopChaseMusic() {
    if (!this.chaseActive) return;
    this.chaseActive = false;

    if (this.chasePulseTimer) {
      clearTimeout(this.chasePulseTimer);
      this.chasePulseTimer = null;
    }
    if (this.chaseOstinatoTimer) {
      clearTimeout(this.chaseOstinatoTimer);
      this.chaseOstinatoTimer = null;
    }

    if (this.ctx && this.chaseGain) {
      const now = this.ctx.currentTime;
      try {
        this.chaseGain.gain.cancelScheduledValues(now);
        this.chaseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      } catch {
        // Ignored
      }
      setTimeout(() => {
        try {
          if (this.chaseDroneOsc) {
            this.chaseDroneOsc.stop();
            this.chaseDroneOsc.disconnect();
            this.chaseDroneOsc = null;
          }
          if (this.chaseDroneFilter) {
            this.chaseDroneFilter.disconnect();
            this.chaseDroneFilter = null;
          }
          if (this.chaseGain) {
            this.chaseGain.disconnect();
            this.chaseGain = null;
          }
        } catch {
          // Ignored
        }
      }, 1500);
    }
  }

  public stopAmbient() {
    this.stopChaseMusic();
    try {
      if (this.ambientOsc1) {
        this.ambientOsc1.stop();
        this.ambientOsc1.disconnect();
        this.ambientOsc1 = null;
      }
      if (this.ambientOsc2) {
        this.ambientOsc2.stop();
        this.ambientOsc2.disconnect();
        this.ambientOsc2 = null;
      }
    } catch {
      // Ignored
    }
  }

  // Mission Completed Triumph Fanfare
  public playMissionComplete() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.14, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.45);
    });
  }

  // Alien Companion Gentle Chirp & Trill
  public playCompanionChirp() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(680, now);
    osc.frequency.exponentialRampToValueAtTime(1150, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.16);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Companion Alert / Danger Warning Chirp
  public playCompanionAlert() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    [0, 0.09, 0.18].forEach((offset, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(950 + idx * 80, now + offset);
      osc.frequency.exponentialRampToValueAtTime(600, now + offset + 0.07);

      gain.gain.setValueAtTime(0.1, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.07);
    });
  }

  // Companion Delighted Purr / Petted Sound
  public playCompanionHappy() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.1, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.22);
    });
  }
}

export const soundEngine = new SoundEngine();
