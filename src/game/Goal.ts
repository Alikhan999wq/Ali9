import { FIELD } from './config';
import type { Ball } from './Ball';

const POST_RADIUS = 7;
const GOAL_DEPTH = 48;
const BOUNCE = 0.74;

export class Goal {
  readonly lineX: number;
  readonly topPostY = (FIELD.height - FIELD.goalWidth) / 2;
  readonly bottomPostY = this.topPostY + FIELD.goalWidth;
  readonly backX: number;

  constructor(readonly side: 'left' | 'right') {
    this.lineX = side === 'left' ? FIELD.margin : FIELD.width - FIELD.margin;
    this.backX = this.lineX + (side === 'left' ? -GOAL_DEPTH : GOAL_DEPTH);
  }

  crossedCompletelyBy(ball: Ball) {
    const crossedLine = this.side === 'left'
      ? ball.x + ball.radius < this.lineX
      : ball.x - ball.radius > this.lineX;
    const centerBetweenPosts = ball.y > this.topPostY && ball.y < this.bottomPostY;
    return crossedLine && centerBetweenPosts;
  }

  resolveFrameCollisions(ball: Ball) {
    const hitPost = this.resolvePost(ball, this.topPostY) || this.resolvePost(ball, this.bottomPostY);
    const insideNet = ball.y > this.topPostY && ball.y < this.bottomPostY;
    if (!insideNet) {
      this.resolveEndLineBarrier(ball);
      return hitPost;
    }
    if (this.side === 'left' && ball.x - ball.radius < this.backX) {
      ball.x = this.backX + ball.radius;
      ball.vx = Math.abs(ball.vx) * .72;
    }
    if (this.side === 'right' && ball.x + ball.radius > this.backX) {
      ball.x = this.backX - ball.radius;
      ball.vx = -Math.abs(ball.vx) * .72;
    }
    return hitPost;
  }

  private resolveEndLineBarrier(ball: Ball) {
    if (this.side === 'left' && ball.x - ball.radius < this.lineX) {
      ball.x = this.lineX + ball.radius;
      ball.vx = Math.abs(ball.vx) * BOUNCE;
    }
    if (this.side === 'right' && ball.x + ball.radius > this.lineX) {
      ball.x = this.lineX - ball.radius;
      ball.vx = -Math.abs(ball.vx) * BOUNCE;
    }
  }

  private resolvePost(ball: Ball, postY: number) {
    const dx = ball.x - this.lineX;
    const dy = ball.y - postY;
    const distance = Math.hypot(dx, dy);
    const minimum = ball.radius + POST_RADIUS;
    if (distance >= minimum) return false;
    const nx = distance ? dx / distance : (this.side === 'left' ? 1 : -1);
    const ny = distance ? dy / distance : 0;
    ball.x = this.lineX + nx * minimum;
    ball.y = postY + ny * minimum;
    const velocityAlongNormal = ball.vx * nx + ball.vy * ny;
    if (velocityAlongNormal >= 0) return true;
    ball.vx -= 1.72 * velocityAlongNormal * nx;
    ball.vy -= 1.72 * velocityAlongNormal * ny;
    return true;
  }
}
