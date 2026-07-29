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
    const top = (FIELD.height - FIELD.goalWidth) / 2;
    const inGoal = this.y > top && this.y < top + FIELD.goalWidth;
    if (this.y - this.radius < FIELD.margin) this.vy = Math.abs(this.vy) * 0.7;
    if (this.y + this.radius > FIELD.height - FIELD.margin) this.vy = -Math.abs(this.vy) * 0.7;
    if (!inGoal && this.x - this.radius < FIELD.margin && this.x > FIELD.margin - 8) this.vx *= .96;
    if (!inGoal && this.x + this.radius > FIELD.width - FIELD.margin && this.x < FIELD.width - FIELD.margin + 8) this.vx *= .96;
  }
}
