import { AI_LEVELS } from './config';
import { distance, direction } from './math';
import type { Ball } from './Ball';
import type { Player } from './Player';
import type { Difficulty } from './config';

interface AIContext {
  ball: Ball;
  players: Player[];
  difficulty: Difficulty;
  kick: (player: Player) => boolean;
}

export class AIPlayer {
 static update(player: Player, dt: number, game: AIContext) {
  const level = AI_LEVELS[game.difficulty];
  const teammates = game.players.filter((candidate) => candidate.team === player.team);
  const closest = teammates.reduce((best, candidate) =>
    distance(candidate, game.ball) < distance(best, game.ball) ? candidate : best);
  const target = closest === player
    ? game.ball
    : { x: player.homeX + (game.ball.x - 600) * .2, y: player.homeY + (game.ball.y - 350) * .25 };
  player.move(target.x - player.x, target.y - player.y, dt, level.speed);
  if (distance(player, game.ball) >= 55) return;
  const aim = direction(player.team ? -1 : 1, (350 - player.y) / (350 / level.accuracy));
  player.faceX = aim.x;
  player.faceY = aim.y;
  game.kick(player);
 }
}

export const updateAIPlayer = (player: Player, dt: number, game: AIContext) =>
  AIPlayer.update(player, dt, game);
