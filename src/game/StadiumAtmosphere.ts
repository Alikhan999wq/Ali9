const ROOT = `${import.meta.env.BASE_URL}assets/sounds/crowd/`;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export class StadiumAtmosphere {
  private ambience = [
    new Audio(`${ROOT}ambience-stadium.mp3`),
    new Audio(`${ROOT}ambience-arena.mp3`),
  ];
  private celebration = new Audio(`${ROOT}goal-celebration.mp3`);
  private applause = new Audio(`${ROOT}final-applause.mp3`);
  private timer: number;
  private unlocked = false;
  private paused = false;
  private intensity = 0;
  private smoothIntensity = 0;
  private celebrationLeft = 0;
  private finishLeft = 0;
  private shotLeft = 0;
  private ducked = false;
  private duckMix = 1;
  private phase = Math.random() * Math.PI * 2;

  constructor(private volume: number, private enabled: boolean) {
    this.ambience.forEach((audio) => {
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
    });
    this.celebration.preload = 'auto';
    this.applause.preload = 'auto';
    this.timer = window.setInterval(() => this.tick(.05), 50);
  }

  configure(volume: number, enabled: boolean) {
    const wasEnabled = this.enabled;
    this.volume = volume;
    this.enabled = enabled;
    if (!enabled) {
      [...this.ambience, this.celebration, this.applause].forEach((audio) => audio.pause());
      return;
    }
    if (!wasEnabled && this.unlocked && !this.paused) {
      this.ambience.forEach((audio) => void audio.play().catch(() => undefined));
    }
  }

  unlock() {
    if (!this.enabled || this.unlocked) return;
    this.unlocked = true;
    this.ambience.forEach((audio, index) => {
      if (audio.duration && Number.isFinite(audio.duration)) {
        audio.currentTime = (audio.duration * (.18 + index * .37)) % audio.duration;
      }
      void audio.play().catch(() => undefined);
    });
  }

  setIntensity(value: number) {
    this.intensity = clamp(value);
  }

  setDucked(ducked: boolean) {
    this.ducked = ducked;
  }

  reactToShot() {
    if (!this.enabled) return;
    this.unlock();
    this.shotLeft = 1.8;
  }

  celebrateGoal() {
    if (!this.enabled) return;
    this.unlock();
    this.celebrationLeft = 8;
    this.celebration.currentTime = 0;
    this.celebration.volume = clamp(this.volume);
    void this.celebration.play().catch(() => undefined);
  }

  finishMatch() {
    if (!this.enabled) return;
    this.unlock();
    this.finishLeft = 7;
    this.applause.currentTime = 0;
    this.applause.volume = clamp(this.volume * .9);
    void this.applause.play().catch(() => undefined);
  }

  pause() {
    this.paused = true;
    [...this.ambience, this.celebration, this.applause].forEach((audio) => audio.pause());
  }

  resume() {
    if (!this.enabled || !this.unlocked) return;
    this.paused = false;
    this.ambience.forEach((audio) => void audio.play().catch(() => undefined));
    if (this.celebrationLeft > 0) void this.celebration.play().catch(() => undefined);
    if (this.finishLeft > 0) void this.applause.play().catch(() => undefined);
  }

  destroy() {
    clearInterval(this.timer);
    [...this.ambience, this.celebration, this.applause].forEach((audio) => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    });
  }

  private tick(dt: number) {
    if (!this.enabled || !this.unlocked || this.paused) return;
    this.phase += dt * .075;
    this.smoothIntensity += (this.intensity - this.smoothIntensity) * .065;
    this.celebrationLeft = Math.max(0, this.celebrationLeft - dt);
    this.finishLeft = Math.max(0, this.finishLeft - dt);
    this.shotLeft = Math.max(0, this.shotLeft - dt);
    this.duckMix += ((this.ducked ? .75 : 1) - this.duckMix) * .09;

    const normal = .24 + this.smoothIntensity * .52;
    const shotBoost = this.shotLeft > 0 ? Math.min(.82, .48 + this.shotLeft * .22) : 0;
    const goalBoost = this.celebrationLeft > 0 ? Math.min(1, this.celebrationLeft / 2) : 0;
    const finalFade = this.finishLeft > 0 ? Math.min(1, this.finishLeft / 3) : 1;
    const master = this.volume * Math.max(normal, shotBoost, .88 * goalBoost) * finalFade * this.duckMix;
    const blend = .5 + Math.sin(this.phase) * .32;
    this.ambience[0].volume = clamp(master * blend);
    this.ambience[1].volume = clamp(master * (1 - blend));

    if (this.celebrationLeft > 0) {
      const fade = Math.min(1, this.celebrationLeft / 2);
      this.celebration.volume = clamp(this.volume * fade * this.duckMix);
    }
    if (this.finishLeft > 0) this.applause.volume = clamp(this.volume * Math.min(1, this.finishLeft / 3) * this.duckMix);
    if (this.finishLeft === 0 && !this.applause.paused) {
      this.applause.pause();
      this.ambience.forEach((audio) => audio.pause());
    }
  }
}
