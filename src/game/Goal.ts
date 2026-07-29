import { FIELD } from './config';
import type { Ball } from './Ball';

export class Goal {
  constructor(private side: 'left' | 'right') {}

  crossedBy(ball: Ball) {
    const top = (FIELD.height - FIELD.goalWidth) / 2;
    const insidePosts = ball.y - ball.radius > top && ball.y + ball.radius < top + FIELD.goalWidth;
    const crossedLine = this.side === 'left'
      ? ball.x + ball.radius < FIELD.margin
      : ball.x - ball.radius > FIELD.width - FIELD.margin;
    return insidePosts && crossedLine;
  }
}
