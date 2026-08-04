import { AI_LEVELS, FIELD, MATCH_SECONDS, TEAMS } from './config';
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
import type { MatchEvent, MatchOptions, MatchSnapshot, Stats } from './types';

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
  private activePlayerId = 0;
  private switchCooldown = 0;
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
      options.language,
    );
    this.resetPositions();
    this.commentary.announce('start');
  }

  key(code: string, pressed: boolean) {
    if (pressed && code === 'KeyQ' && !this.keys.has(code)) this.switchPlayer();
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
  switchPlayer() {
    if (this.state.state !== 'playing') return;
    const active = this.getActivePlayer();
    const owner = this.getBallOwner();
    if (owner?.team === 0 && owner.id === active.id) return;
    const target = owner?.team === 0
      ? owner
      : this.players
        .filter((player) => player.team === 0 && player.id !== active.id)
        .sort((a, b) => distance(a, this.ball) - distance(b, this.ball))[0];
    if (target) this.selectPlayer(target, .34);
  }
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
    this.options = options;
    this.audio.setVolume(options.effectsEnabled ? options.volume : 0);
    this.commentary.configure(options.commentaryVolume, options.commentaryEnabled, options.language);
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
    this.switchCooldown = Math.max(0, this.switchCooldown - dt);
    this.ballControl.updateTimers(dt);
    this.manualAimTimer = Math.max(0, this.manualAimTimer - dt);
    this.autoSelectPlayer();
    const human = this.getActivePlayer();
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
    this.players.filter((player) => player.id !== this.activePlayerId).forEach((player) => updateAIPlayer(player, dt, {
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
    const showAim = this.ballControl.isOwnedBy(this.getActivePlayer());
    renderMatch(this.context, this.players, this.ball, this.referee, this.elapsed, this.options.team, opponent, showAim ? this.aim : null);
  }

  private getBallOwner() {
    return this.ballControl.ownerId === null
      ? undefined
      : this.players.find((player) => player.id === this.ballControl.ownerId);
  }

  private getActivePlayer() {
    return this.players.find((player) => player.id === this.activePlayerId) ?? this.players[0];
  }

  private selectPlayer(player: Player, cooldown = .5) {
    if (player.team !== 0 || player.id === this.activePlayerId) return;
    this.activePlayerId = player.id;
    this.players.forEach((candidate) => { candidate.controlled = candidate.id === player.id; });
    this.aim = player.getAimDirection();
    this.manualAimTimer = 0;
    this.switchCooldown = cooldown;
  }

  private autoSelectPlayer() {
    if (!this.options.autoSwitch || this.switchCooldown > 0) return;
    const active = this.getActivePlayer();
    const owner = this.getBallOwner();
    if (owner?.team === 0) {
      if (owner.id !== active.id) this.selectPlayer(owner);
      return;
    }
    const defending = owner?.team === 1 || (owner === undefined && this.ball.lastTouch === 1);
    if (!defending) return;
    const closest = this.players
      .filter((player) => player.team === 0)
      .sort((a, b) => distance(a, this.ball) - distance(b, this.ball))[0];
    if (!closest || closest.id === active.id) return;
    const improvement = distance(active, this.ball) - distance(closest, this.ball);
    if (improvement > 75 || distance(active, this.ball) > 190) this.selectPlayer(closest, .55);
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
    const owner = this.getBallOwner();
    const tackleSuccess = owner && owner.team !== player.team && player.team === 1
      ? AI_LEVELS[this.options.difficulty].tackle
      : 1;
    const captured = this.ballControl.tryCapture(player, this.ball, owner, tackleSuccess);
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
    this.showEvent(
      inBox || severe ? 'var' : 'foul',
      severe ? 'event.redCard' : inBox ? 'event.penalty' : 'event.freeKick',
      inBox ? 'event.foulInBox' : 'event.foulDanger',
      { player: offender.number },
      'event.rule12',
      inBox || severe ? 2.8 : 1.6,
    );
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
    this.showEvent('goal', 'event.goal', 'event.score', { home: this.state.score[0], away: this.state.score[1] }, undefined, 1.8);
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

  private showEvent(
    kind: MatchEvent['kind'],
    titleKey: MatchEvent['titleKey'],
    detailKey: MatchEvent['detailKey'],
    values?: MatchEvent['values'],
    ruleKey?: MatchEvent['ruleKey'],
    duration = 1.6,
  ) {
    this.state.event = { id: ++this.eventId, kind, titleKey, detailKey, values, ruleKey };
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
    this.activePlayerId = this.players[0].id;
    this.players.forEach((player) => { player.controlled = player.id === this.activePlayerId; });
    this.switchCooldown = 0;
    this.ballControl.reset(); this.ball = new Ball(600, 350); this.referee = new Referee();
  }
}

export { GameEngine as MatchManager };
