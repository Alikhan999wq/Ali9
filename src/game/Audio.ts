export class GameAudio {
  private context?: AudioContext;
  constructor(private volume: number) {}

  setVolume(volume: number) {
    this.volume = volume;
  }

  private tone(frequency: number, duration = 0.1, type: OscillatorType = 'sine') {
    this.context ??= new AudioContext();
    if (!this.volume) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gain.gain.setValueAtTime(0.08 * this.volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }

  kick() { this.tone(95, 0.08, 'square'); }
  whistle() { this.tone(1500, 0.32); }
  goal() { [330, 440, 554, 659].forEach((note, i) => setTimeout(() => this.tone(note, 0.35, 'sawtooth'), i * 90)); }
  crowd() {
    this.context ??= new AudioContext();
    if (!this.volume) return;
    const context = this.context;
    const duration = 2.8;
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const samples = buffer.getChannelData(0);
    let rolling = 0;
    for (let index = 0; index < samples.length; index++) {
      rolling = rolling * .985 + (Math.random() * 2 - 1) * .12;
      samples[index] = rolling;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    filter.type = 'bandpass'; filter.frequency.value = 900; filter.Q.value = .45;
    gain.gain.setValueAtTime(.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.28 * this.volume, context.currentTime + .16);
    gain.gain.setValueAtTime(.2 * this.volume, context.currentTime + 1.8);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
    source.buffer = buffer; source.connect(filter).connect(gain).connect(context.destination); source.start();
    Array.from({ length: 22 }, (_, index) =>
      setTimeout(() => this.tone(150 + Math.random() * 180, .045, 'square'), index * 85));
  }
  end() { this.whistle(); setTimeout(() => this.whistle(), 420); }
}
