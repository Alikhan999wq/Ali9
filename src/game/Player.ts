import { FIELD } from './config';
import { clamp, direction, distance } from './math';
import { Ball } from './Ball';

export class Player {
  radius = 19;
  vx = 0;
  vy = 0;
  faceX: number;
  faceY = 0;
  kickTime = 0;
  card = 0;
  celebrating = 0;
  falling = 0;

  constructor(
    public x: number,
    public y: number,
    public readonly homeX: number,
    public readonly homeY: number,
    public readonly team: number,
    public readonly number: number,
    public readonly id: number,
    public readonly controlled = false,
  ) {
    this.faceX = team === 0 ? 1 : -1;
  }

  move(dx: number, dy: number, dt: number, speed = 1) {
    const active = Math.abs(dx) + Math.abs(dy) > 0.01;
    const target = 245 * speed;
    const aim = direction(dx, dy);
    const blend = Math.min(1, 950 * dt / target);
    if (active) {
      this.vx += (aim.x * target - this.vx) * blend;
      this.vy += (aim.y * target - this.vy) * blend;
      this.faceX = aim.x;
      this.faceY = aim.y;
    } else {
      this.vx *= 0.84;
      this.vy *= 0.84;
    }
    this.x = clamp(this.x + this.vx * dt, FIELD.margin + this.radius, FIELD.width - FIELD.margin - this.radius);
    this.y = clamp(this.y + this.vy * dt, FIELD.margin + this.radius, FIELD.height - FIELD.margin - this.radius);
    this.kickTime = Math.max(0, this.kickTime - dt);
    this.celebrating = Math.max(0, this.celebrating - dt);
    this.falling = Math.max(0, this.falling - dt);
  }

  kick(ball: Ball, strong: boolean) {
    if (distance(this, ball) > 58 || this.kickTime > 0) return false;
    const aim = direction(this.faceX, this.faceY);
    const power = strong ? 820 : 570;
    ball.vx = aim.x * power + this.vx * 0.25;
    ball.vy = aim.y * power + this.vy * 0.25;
    ball.lastTouch = this.team;
    this.kickTime = 0.2;
    return true;
  }
}
