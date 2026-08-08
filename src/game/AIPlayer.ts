import { AI_LEVELS, type AILevel } from './config';
import { distance, direction } from './math';
import type { Ball } from './Ball';
import type { Player } from './Player';
import type { Difficulty } from './config';
import type { FieldGeometry } from './maps';

interface AIContext {
  ball: Ball;
  players: Player[];
  difficulty: Difficulty;
  kick: (player: Player) => boolean;
  controlsBall: (player: Player) => boolean;
  field: FieldGeometry;
}

interface Decision {
  x: number;
  y: number;
  timer: number;
}

const decisions = new WeakMap<Player, Decision>();
const TEAMMATE_LEVEL: AILevel = {
  speed: 0.65, accuracy: 0.55, reaction: 1.2,
  tackle: 0.7, mistake: 0.06, decisionDelay: 0.14,
};

function kickAim(player: Player, level: AILevel, field: FieldGeometry) {
  const goalX = player.team ? field.margin : field.width - field.margin;
  const spread = (1 - level.accuracy) * field.goalWidth * 1.35;
  const mistake = Math.random() < level.mistake ? 1.8 : 1;
  const goalY = field.height / 2 + (Math.random() - .5) * spread * mistake;
  return direction(goalX - player.x, goalY - player.y);
}

function movementTarget(player: Player, dt: number, game: AIContext, level: AILevel) {
  const previous = decisions.get(player) ?? { x: player.x, y: player.y, timer: 0 };
  previous.timer -= dt;
  if (previous.timer > 0) return previous;
  const teammates = game.players.filter((candidate) => candidate.team === player.team);
  const closest = teammates.reduce((best, candidate) =>
    distance(candidate, game.ball) < distance(best, game.ball) ? candidate : best);
  const target = closest === player
    ? game.ball
    : { x: player.homeX + (game.ball.x - game.field.width / 2) * .2, y: player.homeY + (game.ball.y - game.field.height / 2) * .25 };
  previous.x = target.x;
  previous.y = target.y;
  previous.timer = level.decisionDelay * (.8 + Math.random() * .4);
  decisions.set(player, previous);
  return previous;
}

export class AIPlayer {
 static update(player: Player, dt: number, game: AIContext) {
  const level = player.team === 1 ? AI_LEVELS[game.difficulty] : TEAMMATE_LEVEL;
  if (game.controlsBall(player)) {
    const aim = kickAim(player, level, game.field);
    player.move(aim.x, aim.y, dt, level.speed);
    player.faceX = aim.x;
    player.faceY = aim.y;
    if (Math.random() <= dt * level.reaction) game.kick(player);
    return;
  }
  const target = movementTarget(player, dt, game, level);
  if (player.team === 1 && Math.random() < dt * level.mistake) {
    player.move(player.homeX - player.x, player.homeY - player.y, dt, level.speed * .55);
    return;
  }
  player.move(target.x - player.x, target.y - player.y, dt, level.speed);
  if (distance(player, game.ball) >= 55 || Math.random() > dt * level.reaction) return;
  const aim = kickAim(player, level, game.field);
  player.faceX = aim.x;
  player.faceY = aim.y;
  game.kick(player);
 }
}

export const updateAIPlayer = (player: Player, dt: number, game: AIContext) =>
  AIPlayer.update(player, dt, game);
