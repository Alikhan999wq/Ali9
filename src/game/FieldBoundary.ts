import type { Ball } from './Ball';
import type { FieldGeometry } from './maps';

const BOUNCE = 0.74;

export class FieldBoundary {
  constructor(private readonly field: FieldGeometry) {}

  resolveSidelineCollisions(ball: Ball) {
    const top = this.field.margin;
    const bottom = this.field.height - this.field.margin;
    let collided = false;

    if (ball.y - ball.radius < top) {
      ball.y = top + ball.radius;
      ball.vy = Math.abs(ball.vy) * BOUNCE;
      collided = true;
    }
    if (ball.y + ball.radius > bottom) {
      ball.y = bottom - ball.radius;
      ball.vy = -Math.abs(ball.vy) * BOUNCE;
      collided = true;
    }

    return collided;
  }
}
