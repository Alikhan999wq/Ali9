import { FIELD, MATCH_SECONDS, TEAMS } from './config';
import { updateAIPlayer } from './AIPlayer';
import { Ball } from './Ball';
import { BallControl } from './BallControl';
import { GameAudio } from './Audio';
import { Commentary } from './Commentary';
import { FieldBoundary } from './FieldBoundary';
import { Goal } from './Goal';
import { distance, direction } from './math';
import { Player } from './Player';
import { Referee } from './Referee';
import { renderMatch } from './render';
import { createPlayers } from './squad';
import { StadiumAtmosphere } from './StadiumAtmosphere';
import type { MatchOptions, MatchSnapshot, Stats } from './types';

const emptyStats = (): Stats => ({
  shots: [0, 0], onTarget: [0, 0], possession: [0, 0], passes: [0, 0],
  passAttempts: [0, 0], fouls: [0, 0], cards: [0, 0], offsides: [0, 0],
});

export class GameEngine {
  private players: Player[] = [];
  private ball = new Ball(600, 350);
  private ballControl = new BallControl();
  private referee = new Referee();
  private fieldBoundary = new FieldBoundary();
  private goals = [new Goal('left'), new Goal('right')];
  private keys = new Set<string>();
  private mobile = { x: 0, y: 0 };
  private aim = { x: 1, y: 0 };
  private manualAimTimer = 0;
  private kickQueued = false;
  private elapsed = 0;
  private eventTimer = 0;
  private eventId = 0;
  private pendingReset = false;
  private collisionCooldown = 0;
  private audio: GameAudio;
  private commentary: Commentary;
  private atmosphere: StadiumAtmosphere;
  private state: MatchSnapshot = {
    state: 'playing', score: [0, 0], seconds: MATCH_SECONDS, stats: emptyStats(), event: null,
  };

  constructor(private context: CanvasRenderingContext2D, private options: MatchOptions) {
    this.audio = new GameAudio(options.effectsEnabled ? options.volume : 0);
    this.atmosphere = new StadiumAtmosphere(options.crowdVolume, options.crowdEnabled);
    this.commentary = new Commentary(
      (speaking) => this.atmosphere.setDucked(speaking),
      options.commentaryVolume,
      options.commentaryEnabled,
    );
    this.resetPositions();
    this.commentary.announce('start');
  }

  key(code: string, pressed: boolean) {
    pressed ? this.keys.add(code) : this.keys.delete(code);
    if (pressed) { this.commentary.unlock(); this.atmosphere.unlock(); }
  }
  setMove(x: number, y: number) {
    this.mobile = { x, y };
    if (Math.abs(x) + Math.abs(y) > .05) { this.commentary.unlock(); this.atmosphere.unlock(); }
  }
  setAimPoint(x: number, y: number) {
    if (Math.hypot(x - this.ball.x, y - this.ball.y) < 2) return;
    this.aim = direction(x - this.ball.x, y - this.ball.y);
    this.manualAimTimer = .08;
  }
  setAimDirection(x: number, y: number) {
    if (Math.hypot(x, y) < .08) return;
    this.commentary.unlock(); this.atmosphere.unlock();
    this.aim = direction(x, y);
    this.manualAimTimer = 1.5;
  }
  queueKick() { this.commentary.unlock(); this.atmosphere.unlock(); this.kickQueued = true; }
  destroy() { this.commentary.stop(); this.atmosphere.destroy(); }
  pause() {
    if (this.state.state === 'ended') return;
    if (this.state.state === 'paused') {
      this.state.state = 'playing';
      this.commentary.resume();
      this.atmosphere.resume();
    } else {
      this.state.state = 'paused';
      this.commentary.pause();
      this.atmosphere.pause();
    }
  }
  snapshot(): MatchSnapshot { return structuredClone(this.state); }

  configureAudio(options: MatchOptions) {
    this.audio.setVolume(options.effectsEnabled ? options.volume : 0);
    this.commentary.configure(options.commentaryVolume, options.commentaryEnabled);
    this.atmosphere.configure(options.crowdVolume, options.crowdEnabled);
  }

  update(dt: number) {
    if (this.state.state !== 'playing') return;
    this.atmosphere.setIntensity(this.crowdIntensity());
    if (this.eventTimer > 0) { this.updateEvent(dt); return; }
    this.state.seconds = Math.max(0, this.state.seconds - dt);
    if (!this.state.seconds) {
      this.state.state = 'ended'; this.audio.end(); this.commentary.announce('end');
      this.atmosphere.finishMatch(); return;
    }
    this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    this.ballControl.updateTimers(dt);
    this.manualAimTimer = Math.max(0, this.manualAimTimer - dt);
    const human = this.players[0];
    const dx = Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA')) + this.mobile.x;
    const dy = Number(this.keys.has('KeyS')) - Number(this.keys.has('KeyW')) + this.mobile.y;
    human.move(dx, dy, dt);
    if (Math.abs(dx) + Math.abs(dy) > .05 && this.manualAimTimer === 0) this.aim = direction(dx, dy);
    const hasControl = this.ballControl.isOwnedBy(human);
    if (hasControl) {
      human.faceX = this.aim.x; human.faceY = this.aim.y;
    }
    const passing = this.keys.has('KeyE');
    if ((this.keys.has('Space') || this.kickQueued || passing) && this.tryKick(human, this.aim, passing ? 330 : 570, !passing)) {
      this.audio.kick();
    }
    this.kickQueued = false;
    this.players.slice(1).forEach((player) => updateAIPlayer(player, dt, {
      ball: this.ball, players: this.players, difficulty: this.options.difficulty,
      kick: (candidate) => {
        const kicked = this.tryKick(candidate);
        if (kicked) this.audio.kick();
        return kicked;
      },
      controlsBall: (candidate) => this.ballControl.isOwnedBy(candidate),
    }));
    this.resolveContacts();
    const owner = this.getBallOwner();
    if (owner) this.ballControl.carry(this.ball, owner, dt);
    else this.ball.update(dt);
    this.referee.update(this.ball, dt);
    if (this.ball.lastTouch !== null) this.state.stats.possession[this.ball.lastTouch] += dt;
    this.checkFieldEvents();
    this.elapsed += dt;
  }

  draw() {
    const opponent = (this.options.team + 1) % TEAMS.length;
    const showAim = this.ballControl.isOwnedBy(this.players[0]);
    renderMatch(this.context, this.players, this.ball, this.referee, this.elapsed, this.options.team, opponent, showAim ? this.aim : null);
  }

  private getBallOwner() {
    return this.ballControl.ownerId === null ? undefined : this.players[this.ballControl.ownerId];
  }

  private tryKick(player: Player, aim?: { x: number; y: number }, power = 570, shot = true) {
    if (!this.ballControl.isOwnedBy(player)) return false;
    if (!player.kick(this.ball, aim, power)) return false;
    this.ballControl.release(player);
    if (shot) this.state.stats.shots[player.team]++;
    this.state.stats.passAttempts[player.team]++;
    const towardGoal = player.team === 0 ? this.ball.vx > 180 : this.ball.vx < -180;
    const dangerous = towardGoal && Math.abs(this.ball.y - FIELD.height / 2) < FIELD.goalWidth * .55;
    if (shot && towardGoal) this.atmosphere.reactToShot();
    if (shot && dangerous) {
      this.state.stats.onTarget[player.team]++;
      this.commentary.announce('danger');
    } else if (shot && towardGoal) {
      this.commentary.announce('shot');
    }
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
    if (distance(player, this.ball) >= player.radius + this.ball.radius + 1) return;
    const incomingSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    const nearOwnGoal = player.team === 0 ? player.x < 255 : player.x > FIELD.width - 255;
    if (incomingSpeed > 260 && nearOwnGoal && this.ball.lastTouch !== player.team) this.commentary.announce('save');
    const previous = this.ball.lastPlayer;
    const captured = this.ballControl.tryCapture(player, this.ball, this.getBallOwner());
    if (captured && previous !== null && previous !== player.id && this.players[previous]?.team === player.team) {
      this.state.stats.passes[player.team]++;
    }
  }

  private callFoul(a: Player, b: Player) {
    const offender = Math.hypot(a.vx, a.vy) > Math.hypot(b.vx, b.vy) ? a : b;
    const victim = offender === a ? b : a, severe = Math.random() > .78;
    const inBox = offender.team ? offender.x > 955 : offender.x < 245;
    offender.card += severe ? 2 : 1; victim.falling = 1;
    this.state.stats.fouls[offender.team]++; this.state.stats.cards[offender.team]++;
    this.referee.showCard(severe); this.audio.whistle(); this.collisionCooldown = 4;
    this.commentary.announce('foul');
    this.commentary.announce(severe ? 'red' : 'yellow');
    this.showEvent(inBox || severe ? 'var' : 'foul', severe ? 'Красная карточка' : inBox ? 'Пенальти' : 'Штрафной удар',
      `Игрок №${offender.number} нарушил правила. ${inBox ? 'Контакт произошёл внутри штрафной площади.' : 'Зафиксирован опасный контакт.'}`,
      'Правило 12 IFAB: нарушения и недисциплинированное поведение.', inBox || severe ? 2.8 : 1.6);
  }

  private checkFieldEvents() {
    const hitPost = this.goals.some((goal) => goal.resolveFrameCollisions(this.ball));
    if (hitPost) this.commentary.announce('post');
    if (this.goals[0].crossedCompletelyBy(this.ball)) return this.scoreGoal(1);
    if (this.goals[1].crossedCompletelyBy(this.ball)) return this.scoreGoal(0);
    this.fieldBoundary.resolveSidelineCollisions(this.ball);
  }

  private scoreGoal(team: number) {
    this.state.score[team]++; this.audio.goal();
    this.atmosphere.celebrateGoal();
    this.commentary.announce('goal');
    this.players.filter((player) => player.team === team).forEach((player) => { player.celebrating = 1.8; });
    this.pendingReset = true;
    this.showEvent('goal', 'ГОЛ!', `${this.state.score[0]} : ${this.state.score[1]}`, undefined, 1.8);
  }

  private crowdIntensity() {
    const team = this.ball.lastTouch;
    if (team === null) return 0;
    const progress = team === 0 ? this.ball.x / FIELD.width : 1 - this.ball.x / FIELD.width;
    const central = Math.max(.25, 1 - Math.abs(this.ball.y - FIELD.height / 2) / (FIELD.height * .55));
    const attack = Math.max(0, (progress - .48) / .52) * central;
    const towardGoal = team === 0 ? this.ball.vx > 120 : this.ball.vx < -120;
    const shotBoost = towardGoal ? Math.min(.35, Math.abs(this.ball.vx) / 1300) : 0;
    return Math.min(1, attack + shotBoost);
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

  private resetPositions() {
    this.players = createPlayers();
    this.ballControl.reset(); this.ball = new Ball(600, 350); this.referee = new Referee();
  }
}

export { GameEngine as MatchManager };
