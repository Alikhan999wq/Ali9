import { FIELD, MATCH_SECONDS } from './config';
import { updateAIPlayer } from './AIPlayer';
import { Ball } from './Ball';
import { GameAudio } from './Audio';
import { Goal } from './Goal';
import { distance, direction } from './math';
import { Player } from './Player';
import { Referee } from './Referee';
import { renderMatch } from './render';
import { createPlayers } from './squad';
import type { MatchOptions, MatchSnapshot, Stats } from './types';

const emptyStats = (): Stats => ({
  shots: [0, 0], onTarget: [0, 0], possession: [0, 0], passes: [0, 0],
  passAttempts: [0, 0], fouls: [0, 0], cards: [0, 0], offsides: [0, 0], corners: [0, 0],
});

export class GameEngine {
  private players: Player[] = [];
  private ball = new Ball(600, 350);
  private referee = new Referee();
  private goals = [new Goal('left'), new Goal('right')];
  private keys = new Set<string>();
  private mobile = { x: 0, y: 0 };
  private kickQueued = false;
  private elapsed = 0;
  private eventTimer = 0;
  private eventId = 0;
  private pendingReset = false;
  private collisionCooldown = 0;
  private audio: GameAudio;
  private state: MatchSnapshot = {
    state: 'playing', score: [0, 0], seconds: MATCH_SECONDS, stats: emptyStats(), event: null,
  };

  constructor(private context: CanvasRenderingContext2D, private options: MatchOptions) {
    this.audio = new GameAudio(options.volume);
    this.resetPositions();
  }

  key(code: string, pressed: boolean) { pressed ? this.keys.add(code) : this.keys.delete(code); }
  setMove(x: number, y: number) { this.mobile = { x, y }; }
  queueKick(strong = false) { this.kickQueued = true; if (strong) this.keys.add('ShiftLeft'); }
  pause() { this.state.state = this.state.state === 'paused' ? 'playing' : 'paused'; }
  snapshot(): MatchSnapshot { return structuredClone(this.state); }

  update(dt: number) {
    if (this.state.state !== 'playing') return;
    if (this.eventTimer > 0) { this.updateEvent(dt); return; }
    this.state.seconds = Math.max(0, this.state.seconds - dt);
    if (!this.state.seconds) { this.state.state = 'ended'; this.audio.end(); return; }
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    const human = this.players[0];
    const dx = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA')) + this.mobile.x;
    const dy = Number(this.keys.has('KeyS')) - Number(this.keys.has('KeyW')) + this.mobile.y;
    human.move(dx, dy, dt);
    if ((this.keys.has('Space') || this.kickQueued) && this.tryKick(human, this.keys.has('ShiftLeft') || this.keys.has('ShiftRight'))) {
      this.audio.kick();
    }
    this.kickQueued = false; this.keys.delete('ShiftLeft');
    this.players.slice(1).forEach((player) => updateAIPlayer(player, dt, {
      ball: this.ball, players: this.players, difficulty: this.options.difficulty,
      kick: (candidate) => {
        const kicked = this.tryKick(candidate, false);
        if (kicked) this.audio.kick();
        return kicked;
      },
    }));
    this.resolveContacts();
    this.ball.update(dt); this.referee.update(this.ball, dt);
    if (this.ball.lastTouch !== null) this.state.stats.possession[this.ball.lastTouch] += dt;
    this.checkFieldEvents();
    this.elapsed += dt;
  }

  draw() {
    const opponent = this.options.team === 1 ? 0 : 1;
    renderMatch(this.context, this.players, this.ball, this.referee, this.elapsed, this.options.team, opponent);
  }

  private tryKick(player: Player, strong: boolean) {
    if (!player.kick(this.ball, strong)) return false;
    this.state.stats.shots[player.team]++;
    this.state.stats.passAttempts[player.team]++;
    if (Math.abs(this.ball.y - 350) < FIELD.goalWidth * 0.55) this.state.stats.onTarget[player.team]++;
    return true;
  }

  private resolveContacts() {
    this.players.forEach((player) => this.touchBall(player));
    for (let i = 0; i < this.players.length; i++) for (let j = i + 1; j < this.players.length; j++) {
      const a = this.players[i], b = this.players[j], gap = distance(a, b);
      if (gap >= a.radius + b.radius) continue;
      const normal = direction(b.x - a.x, b.y - a.y), overlap = a.radius + b.radius - gap;
      a.x -= normal.x * overlap / 2; a.y -= normal.y * overlap / 2;
      b.x += normal.x * overlap / 2; b.y += normal.y * overlap / 2;
      const impact = Math.hypot(a.vx - b.vx, a.vy - b.vy);
      if (a.team !== b.team && impact > 300 && this.collisionCooldown === 0 && Math.random() < .035) this.callFoul(a, b);
    }
  }

  private touchBall(player: Player) {
    if (distance(player, this.ball) >= player.radius + this.ball.radius) return;
    const previous = this.ball.lastPlayer, normal = direction(this.ball.x - player.x, this.ball.y - player.y);
    if (previous !== null && previous !== player.id && this.players[previous]?.team === player.team) this.state.stats.passes[player.team]++;
    this.ball.x = player.x + normal.x * (player.radius + this.ball.radius);
    this.ball.y = player.y + normal.y * (player.radius + this.ball.radius);
    this.ball.vx += player.vx * .16; this.ball.vy += player.vy * .16;
    this.ball.lastTouch = player.team; this.ball.lastPlayer = player.id;
  }

  private callFoul(a: Player, b: Player) {
    const offender = Math.hypot(a.vx, a.vy) > Math.hypot(b.vx, b.vy) ? a : b;
    const victim = offender === a ? b : a, severe = Math.random() > .78;
    const inBox = offender.team ? offender.x > 955 : offender.x < 245;
    offender.card += severe ? 2 : 1; victim.falling = 1;
    this.state.stats.fouls[offender.team]++; this.state.stats.cards[offender.team]++;
    this.referee.showCard(severe); this.audio.whistle(); this.collisionCooldown = 4;
    this.showEvent(inBox || severe ? 'var' : 'foul', severe ? 'Красная карточка' : inBox ? 'Пенальти' : 'Штрафной удар',
      `Игрок №${offender.number} нарушил правила. ${inBox ? 'Контакт произошёл внутри штрафной площади.' : 'Зафиксирован опасный контакт.'}`,
      'Правило 12 IFAB: нарушения и недисциплинированное поведение.', inBox || severe ? 2.8 : 1.6);
  }

  private checkFieldEvents() {
    if (this.goals[0].crossedBy(this.ball)) return this.scoreGoal(1);
    if (this.goals[1].crossedBy(this.ball)) return this.scoreGoal(0);
    if (this.ball.x < 0 || this.ball.x > FIELD.width) {
      const attack = this.ball.x < 0 ? 1 : 0, defender = 1 - attack;
      if (this.ball.lastTouch === defender) this.state.stats.corners[attack]++;
      this.resetBall();
    }
    if (this.ball.y < 0 || this.ball.y > FIELD.height) this.resetBall();
  }

  private scoreGoal(team: number) {
    this.state.score[team]++; this.audio.goal(); this.audio.applause();
    this.players.filter((player) => player.team === team).forEach((player) => { player.celebrating = 1.8; });
    this.pendingReset = true;
    this.showEvent('goal', 'ГОЛ!', `${this.state.score[0]} : ${this.state.score[1]}`, undefined, 1.8);
  }

  private showEvent(kind: 'goal' | 'foul' | 'var', title: string, detail: string, rule?: string, duration = 1.6) {
    this.state.event = { id: ++this.eventId, kind, title, detail, rule };
    this.eventTimer = duration;
  }

  private updateEvent(dt: number) {
    this.elapsed += dt;
    this.eventTimer = Math.max(0, this.eventTimer - dt);
    if (this.eventTimer) return;
    this.state.event = null; this.referee.hideCard();
    if (this.pendingReset) { this.resetPositions(); this.pendingReset = false; }
    else { this.ball.vx = 0; this.ball.vy = 0; }
  }

  private resetBall() { this.ball = new Ball(600, 350); }
  private resetPositions() {
    this.players = createPlayers();
    this.ball = new Ball(600, 350); this.referee = new Referee();
  }
}

export { GameEngine as MatchManager };
