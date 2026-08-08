import type { Ball } from './Ball';
import type { FieldGeometry } from './maps';

const BOUNCE = 0.74;

export class Goal {
  readonly lineX: number;
  readonly topPostY: number;
  readonly bottomPostY: number;
  readonly backX: number;

  constructor(readonly side: 'left' | 'right', private readonly field: FieldGeometry) {
    this.lineX = side === 'left' ? field.margin : field.width - field.margin;
    this.topPostY = (field.height - field.goalWidth) / 2;
    this.bottomPostY = this.topPostY + field.goalWidth;
    this.backX = this.lineX + (side === 'left' ? -field.goalDepth : field.goalDepth);
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
    const minimum = ball.radius + this.field.postRadius;
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
