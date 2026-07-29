export class GameAudio {
  private context?: AudioContext;
  constructor(private volume: number) {}

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
  applause() { Array.from({ length: 10 }, (_, i) => setTimeout(() => this.tone(180 + Math.random() * 120, .05, 'square'), i * 55)); }
  end() { this.whistle(); setTimeout(() => this.whistle(), 420); }
}
