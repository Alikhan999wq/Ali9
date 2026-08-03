import type { Ball } from './Ball';
import { FIELD } from './config';

const BOUNCE = 0.74;

export class FieldBoundary {
  resolveSidelineCollisions(ball: Ball) {
    const top = FIELD.margin;
    const bottom = FIELD.height - FIELD.margin;
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
