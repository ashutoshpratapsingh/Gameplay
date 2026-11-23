/**
 * SYMBIOTE 3D: APEX PREDATOR (VENOM PROTOCOL)
 * High-Fidelity Procedural Web Audio Engine
 * 
 * Features:
 * - Hyper-realistic 7.62x39mm AK-47 assault rifle gunfire:
 *   * High-pressure supersonic bullet crack transient
 *   * Heavy gunpowder chamber explosion with sub-bass kick
 *   * Mechanical steel bolt carrier clack & cycle
 *   * Brass casing bounce ping on concrete
 *   * 3-round burst at authentic 600 RPM (100ms cycle interval)
 * - Living symbiote wet slime locomotion & organic squelches
 * - Prop camouflage suction & tendril morphing
 * - Visceral bone-crushing Devour execution roar
 * - Proximity heartbeat tension drone
 * - Clean master bus with limiter & compressor (mobile speaker safe)
 */

class VenomAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.compressor = null;
    this.muted = false;
    this.lastSlinkTime = 0;
    this.lastHeartbeatTime = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // Master Dynamics Compressor to prevent clipping & give studio punch
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.85, this.ctx.currentTime);
    }
    return this.muted;
  }

  // --- 1. HYPER-REALISTIC AK-47 ASSAULT RIFLE BURST FIRE ---
  playAK47Burst(rounds = 3) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    for (let r = 0; r < rounds; r++) {
      const delay = r * 0.105; // ~570-600 RPM cyclic rate
      setTimeout(() => {
        if (!this.muted) this.playSingleAK47Round();
      }, delay * 1000);
    }
  }

  playSingleAK47Round() {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // A. Supersonic Bullet Crack (Sharp Metallic Transient)
    const crackOsc = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crackOsc.type = "sawtooth";
    crackOsc.frequency.setValueAtTime(3200 + (Math.random() - 0.5) * 300, now);
    crackOsc.frequency.exponentialRampToValueAtTime(450, now + 0.04);

    crackGain.gain.setValueAtTime(0.7, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    crackOsc.connect(crackGain);
    crackGain.connect(this.compressor);
    crackOsc.start(now);
    crackOsc.stop(now + 0.06);

    // B. Explosive Gunpowder Blast (Filtered White Noise Burst)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.18);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // White noise with exponential envelope
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.22));
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1400, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(320, now + 0.15);
    noiseFilter.Q.setValueAtTime(1.8, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.9, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.compressor);
    noiseSource.start(now);

    // C. Heavy Sub-Bass Chamber Kick (Chest Thump)
    const kickOsc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kickOsc.type = "sine";
    kickOsc.frequency.setValueAtTime(165, now);
    kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.14);

    kickGain.gain.setValueAtTime(0.95, now);
    kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    kickOsc.connect(kickGain);
    kickGain.connect(this.compressor);
    kickOsc.start(now);
    kickOsc.stop(now + 0.17);

    // D. Mechanical Steel Bolt Carrier Slap (Clack-Clack)
    const boltOsc = this.ctx.createOscillator();
    const boltGain = this.ctx.createGain();
    boltOsc.type = "square";
    boltOsc.frequency.setValueAtTime(820, now + 0.02);
    boltOsc.frequency.exponentialRampToValueAtTime(180, now + 0.06);

    boltGain.gain.setValueAtTime(0.001, now);
    boltGain.gain.setValueAtTime(0.35, now + 0.02);
    boltGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    boltOsc.connect(boltGain);
    boltGain.connect(this.compressor);
    boltOsc.start(now + 0.02);
    boltOsc.stop(now + 0.08);

    // E. Spent Brass Casing Ping on Concrete (Delayed metallic ring)
    setTimeout(() => {
      if (this.muted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const pingOsc = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      pingOsc.type = "sine";
      pingOsc.frequency.setValueAtTime(4200 + Math.random() * 600, t);
      pingGain.gain.setValueAtTime(0.12, t);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      pingOsc.connect(pingGain);
      pingGain.connect(this.compressor);
      pingOsc.start(t);
      pingOsc.stop(t + 0.09);
    }, 140 + Math.random() * 40);
  }

  // --- 2. SLINKING SYMBIOTE WET SLIME SOUND ---
  playSlinkSlime() {
    if (this.muted) return;
    const now = performance.now();
    if (now - this.lastSlinkTime < 140) return; // Rate limiter
    this.lastSlinkTime = now;

    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(240 + Math.random() * 80, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.07);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // --- 3. METAMORPHIC PROP CAMOUFLAGE MORPH ---
  playMorphCamouflage(entering = true) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Organic suction swoop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";

    if (entering) {
      // High to low suction
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.22);
    } else {
      // Eruption burst
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(380, t + 0.18);
    }

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // --- 4. VISCERAL DEVOUR EXECUTION (CHOMP & ROAR) ---
  playDevourExecution() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // A. Bone-Crushing Impact (Heavy crunch)
    const crunch = this.ctx.createOscillator();
    const cGain = this.ctx.createGain();
    crunch.type = "sawtooth";
    crunch.frequency.setValueAtTime(320, t);
    crunch.frequency.exponentialRampToValueAtTime(45, t + 0.38);

    cGain.gain.setValueAtTime(0.9, t);
    cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    crunch.connect(cGain);
    cGain.connect(this.compressor);
    crunch.start(t);
    crunch.stop(t + 0.45);

    // B. Bone Splinters
    [850, 1400, 2400].forEach((freq, idx) => {
      const snap = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      snap.type = "triangle";
      snap.frequency.setValueAtTime(freq, t);
      snap.frequency.exponentialRampToValueAtTime(120, t + 0.18);

      sGain.gain.setValueAtTime(0.3, t);
      sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2 + idx * 0.03);

      snap.connect(sGain);
      sGain.connect(this.compressor);
      snap.start(t);
      snap.stop(t + 0.25);
    });

    // C. Guttural Predator Roar
    const roar = this.ctx.createOscillator();
    const rGain = this.ctx.createGain();
    roar.type = "sawtooth";
    roar.frequency.setValueAtTime(140, t + 0.04);
    roar.frequency.exponentialRampToValueAtTime(55, t + 0.5);

    rGain.gain.setValueAtTime(0.001, t);
    rGain.gain.setValueAtTime(0.65, t + 0.08);
    rGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    roar.connect(rGain);
    rGain.connect(this.compressor);
    roar.start(t + 0.04);
    roar.stop(t + 0.6);
  }

  // --- 5. BODYGUARD ALERT SHOUT ---
  playGuardSpotted() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(290, t + 0.22);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  // --- 6. PROXIMITY HEARTBEAT ---
  playHeartbeat(urgent = false) {
    if (this.muted) return;
    const now = performance.now();
    const interval = urgent ? 450 : 900;
    if (now - this.lastHeartbeatTime < interval) return;
    this.lastHeartbeatTime = now;

    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(urgent ? 85 : 58, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.12);

    gain.gain.setValueAtTime(urgent ? 0.45 : 0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.compressor);
    osc.start(t);
    osc.stop(t + 0.17);
  }
}

export const venomAudio = new VenomAudioEngine();
