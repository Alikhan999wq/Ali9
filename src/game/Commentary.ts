export type CommentaryEvent = 'start' | 'goal' | 'goal-extra' | 'danger' | 'shot' | 'save' | 'post' | 'foul' | 'yellow' | 'red' | 'end';

const FILES: Record<CommentaryEvent, string[]> = {
  start: ['start-1.mp3', 'start-2.mp3'],
  goal: ['goal-shout.mp3'],
  'goal-extra': ['goal-extra-1.mp3', 'goal-extra-2.mp3', 'goal-extra-3.mp3', 'goal-extra-4.mp3', 'goal-extra-finish.mp3'],
  danger: ['danger-1.mp3', 'danger-2.mp3'],
  shot: ['shot-1.mp3', 'shot-2.mp3'],
  save: ['save-1.mp3', 'save-2.mp3'],
  post: ['post-1.mp3', 'post-2.mp3'],
  foul: ['foul-1.mp3', 'foul-2.mp3'],
  yellow: ['yellow-1.mp3', 'yellow-2.mp3'],
  red: ['red-1.mp3', 'red-2.mp3'],
  end: ['end-1.mp3', 'end-2.mp3'],
};

export class Commentary {
  private queue: CommentaryEvent[] = [];
  private current: HTMLAudioElement | null = null;
  private unlocked = false;
  private paused = false;
  private lastPlayed = new Map<CommentaryEvent, number>();
  private goalTimer?: number;

  constructor(
    private onSpeakingChange: (speaking: boolean) => void,
    private volume: number,
    private enabled: boolean,
  ) {}

  announce(event: CommentaryEvent) {
    if (this.paused || !this.enabled) return;
    const now = performance.now();
    if (now - (this.lastPlayed.get(event) || 0) < 1800) return;
    this.lastPlayed.set(event, now);
    if (event === 'goal' || event === 'end') {
      clearTimeout(this.goalTimer);
      this.current?.pause();
      this.current = null;
      this.onSpeakingChange(false);
      this.queue = [event];
    } else {
      this.queue.push(event);
    }
    this.playNext();
  }

  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.playNext();
  }

  pause() {
    this.paused = true;
    this.queue = [];
    this.current?.pause();
    this.current = null;
    this.onSpeakingChange(false);
    clearTimeout(this.goalTimer);
  }

  resume() {
    this.paused = false;
  }

  stop() {
    this.paused = true;
    this.queue = [];
    this.current?.pause();
    this.current = null;
    this.onSpeakingChange(false);
    clearTimeout(this.goalTimer);
  }

  private playNext() {
    if (this.paused || !this.unlocked || this.current || !this.queue.length) return;
    const event = this.queue.shift();
    if (!event) return;
    const variants = FILES[event];
    const file = variants[Math.floor(Math.random() * variants.length)];
    const audio = new Audio(`/assets/sounds/voice/${file}`);
    audio.volume = event === 'goal' ? Math.min(1, this.volume * 1.45) : this.volume;
    this.current = audio;
    this.onSpeakingChange(true);
    const finish = () => {
      if (this.current !== audio) return;
      this.current = null;
      this.onSpeakingChange(false);
      if (event === 'goal' && !this.paused) {
        this.goalTimer = window.setTimeout(() => {
          if (this.paused) return;
          this.queue.unshift('goal-extra');
          this.playNext();
        }, 1000 + Math.random() * 1000);
        return;
      }
      this.playNext();
    };
    audio.addEventListener('ended', finish, { once: true });
    audio.addEventListener('error', finish, { once: true });
    void audio.play().catch(finish);
  }
}
