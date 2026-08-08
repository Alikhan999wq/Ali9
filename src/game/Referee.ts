import { direction } from './math';
import type { FieldGeometry } from './maps';

export class Referee {
  x: number;
  y: number;
  private vx = 0;
  private vy = 0;
  card: 0 | 1 | 2 = 0;

  constructor(field: FieldGeometry) {
    this.x = field.width / 2;
    this.y = field.height * .315;
  }

  update(ball: { x: number; y: number }, dt: number) {
    const aim = direction(ball.x - this.x, ball.y - 110 - this.y);
    this.vx += (aim.x * 150 - this.vx) * dt * 2;
    this.vy += (aim.y * 150 - this.vy) * dt * 2;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  showCard(severe: boolean) { this.card = severe ? 2 : 1; }
  hideCard() { this.card = 0; }
}
