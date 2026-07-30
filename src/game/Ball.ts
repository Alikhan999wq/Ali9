import { FIELD } from './config';

export class Ball {
  radius = 11;
  mass = 0.43;
  vx = 0;
  vy = 0;
  spin = 0;
  lastTouch: number | null = null;
  lastPlayer: number | null = null;

  constructor(public x: number, public y: number) {}

  update(dt: number) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    const drag = Math.pow(0.986, dt * 60);
    this.vx *= drag;
    this.vy *= drag;
    this.spin += Math.hypot(this.vx, this.vy) * dt * 0.03;
    if (this.y - this.radius < FIELD.margin) this.vy = Math.abs(this.vy) * 0.7;
    if (this.y + this.radius > FIELD.height - FIELD.margin) this.vy = -Math.abs(this.vy) * 0.7;
  }
}
