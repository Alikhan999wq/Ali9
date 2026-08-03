import type { Ball } from './Ball';
import { direction, distance } from './math';
import type { Player } from './Player';

const CONTROL_GAP = 7;
const RELEASE_LOCK_SECONDS = 0.18;
const TACKLE_LOCK_SECONDS = 0.28;

export class BallControl {
  ownerId: number | null = null;
  private facing = { x: 1, y: 0 };
  private releasedPlayerId: number | null = null;
  private releaseTimer = 0;
  private tackleTimer = 0;

  updateTimers(dt: number) {
    this.releaseTimer = Math.max(0, this.releaseTimer - dt);
    this.tackleTimer = Math.max(0, this.tackleTimer - dt);
    if (this.releaseTimer === 0) this.releasedPlayerId = null;
  }

  isOwnedBy(player: Player) {
    return this.ownerId === player.id;
  }

  tryCapture(player: Player, ball: Ball, currentOwner?: Player) {
    const touching = distance(player, ball) < player.radius + ball.radius + 1;
    if (!touching || player.falling > 0) return false;
    if (this.ownerId === player.id) return false;
    if (this.releasedPlayerId === player.id && this.releaseTimer > 0) return false;
    if (currentOwner) {
      if (currentOwner.team === player.team || this.tackleTimer > 0) return false;
      this.tackleTimer = TACKLE_LOCK_SECONDS;
    }

    this.ownerId = player.id;
    const ballSide = direction(ball.x - player.x, ball.y - player.y);
    this.facing = distance(player, ball) > 1 ? ballSide : player.getAimDirection();
    ball.vx = player.vx;
    ball.vy = player.vy;
    ball.lastTouch = player.team;
    ball.lastPlayer = player.id;
    return true;
  }

  carry(ball: Ball, player: Player, dt: number) {
    const wantedFacing = player.getAimDirection();
    const turnBlend = 1 - Math.exp(-11 * dt);
    const currentAngle = Math.atan2(this.facing.y, this.facing.x);
    const wantedAngle = Math.atan2(wantedFacing.y, wantedFacing.x);
    const angleDifference = Math.atan2(
      Math.sin(wantedAngle - currentAngle),
      Math.cos(wantedAngle - currentAngle),
    );
    const nextAngle = currentAngle + angleDifference * turnBlend;
    this.facing = { x: Math.cos(nextAngle), y: Math.sin(nextAngle) };

    const gap = player.radius + ball.radius + CONTROL_GAP;
    const targetX = player.x + this.facing.x * gap;
    const targetY = player.y + this.facing.y * gap;
    const followBlend = 1 - Math.exp(-24 * dt);
    const previousX = ball.x;
    const previousY = ball.y;
    ball.x += (targetX - ball.x) * followBlend;
    ball.y += (targetY - ball.y) * followBlend;
    ball.vx = (ball.x - previousX) / dt;
    ball.vy = (ball.y - previousY) / dt;
    ball.spin += Math.hypot(ball.vx, ball.vy) * dt * 0.03;
    ball.lastTouch = player.team;
    ball.lastPlayer = player.id;
  }

  release(player: Player) {
    if (!this.isOwnedBy(player)) return false;
    this.ownerId = null;
    this.releasedPlayerId = player.id;
    this.releaseTimer = RELEASE_LOCK_SECONDS;
    return true;
  }

  reset() {
    this.ownerId = null;
    this.releasedPlayerId = null;
    this.releaseTimer = 0;
    this.tackleTimer = 0;
  }
}
