import { clamp, direction, distance } from './math';
import { Ball } from './Ball';
import type { FieldGeometry } from './maps';

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
    public controlled = false,
    private readonly field: FieldGeometry,
  ) {
    this.faceX = team === 0 ? 1 : -1;
  }

  move(dx: number, dy: number, dt: number, speed = 1) {
    const active = Math.abs(dx) + Math.abs(dy) > 0.01;
    const target = 170 * speed;
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
    this.x = clamp(this.x + this.vx * dt, this.field.margin + this.radius, this.field.width - this.field.margin - this.radius);
    this.y = clamp(this.y + this.vy * dt, this.field.margin + this.radius, this.field.height - this.field.margin - this.radius);
    this.kickTime = Math.max(0, this.kickTime - dt);
    this.celebrating = Math.max(0, this.celebrating - dt);
    this.falling = Math.max(0, this.falling - dt);
  }

  getAimDirection() {
    return direction(this.faceX, this.faceY);
  }

  kick(ball: Ball, aimDirection = this.getAimDirection(), power = 570) {
    if (distance(this, ball) > 58 || this.kickTime > 0) return false;
    ball.vx = aimDirection.x * power + this.vx * 0.25;
    ball.vy = aimDirection.y * power + this.vy * 0.25;
    ball.lastTouch = this.team;
    this.kickTime = 0.2;
    return true;
  }
}
