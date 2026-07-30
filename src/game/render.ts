import { FIELD, TEAMS } from './config';
import type { Ball } from './Ball';
import type { Player } from './Player';
import type { Referee } from './Referee';

export function renderField(context: CanvasRenderingContext2D) {
  const { width, height, margin, goalWidth } = FIELD;
  context.fillStyle = '#173f2b';
  context.fillRect(0, 0, width, height);
  for (let x = 0; x < width; x += 100) {
    context.fillStyle = x % 200 ? '#194830' : '#1c5135';
    context.fillRect(x, 0, 100, height);
  }
  context.strokeStyle = '#eef9e8';
  context.lineWidth = 3;
  context.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  context.beginPath(); context.moveTo(width / 2, margin); context.lineTo(width / 2, height - margin); context.stroke();
  context.beginPath(); context.arc(width / 2, height / 2, 92, 0, Math.PI * 2); context.stroke();
  context.strokeRect(margin, 155, 190, 390);
  context.strokeRect(width - margin - 190, 155, 190, 390);
  const goalTop = (height - goalWidth) / 2;
  context.strokeRect(margin - 48, goalTop, 48, goalWidth);
  context.strokeRect(width - margin, goalTop, 48, goalWidth);
  context.fillStyle = '#fff';
  for (const x of [margin, width - margin]) {
    for (const y of [goalTop, goalTop + goalWidth]) {
      context.beginPath(); context.arc(x, y, 7, 0, Math.PI * 2); context.fill();
    }
  }
  context.lineWidth = 7;
  context.beginPath();
  context.moveTo(margin - 48, goalTop); context.lineTo(margin - 48, goalTop + goalWidth);
  context.moveTo(width - margin + 48, goalTop); context.lineTo(width - margin + 48, goalTop + goalWidth);
  context.stroke();
}

export function renderPlayer(context: CanvasRenderingContext2D, player: Player, time: number, teamIndex: number) {
  const team = TEAMS[teamIndex];
  context.save();
  const bounce = player.celebrating > 0 ? Math.sin(time * 15) * 8 : Math.sin(time * 10 + player.number) * 2;
  context.translate(player.x, player.y + bounce);
  if (player.falling > 0) context.rotate(0.85);
  context.fillStyle = '#0b1711aa';
  context.beginPath(); context.ellipse(3, 12, 18, 9, 0, 0, Math.PI * 2); context.fill();
  context.fillStyle = team.primary; context.strokeStyle = team.secondary; context.lineWidth = 4;
  context.beginPath(); context.arc(0, 0, player.radius, 0, Math.PI * 2); context.fill(); context.stroke();
  context.fillStyle = '#fff'; context.font = '700 13px Inter'; context.textAlign = 'center';
  context.fillText(String(player.number), 0, 5);
  if (player.controlled) {
    context.strokeStyle = '#d9f36a'; context.beginPath();
    context.moveTo(-8, -29); context.lineTo(0, -21); context.lineTo(8, -29); context.stroke();
  }
  if (player.card) {
    context.fillStyle = player.card > 1 ? '#ef3e35' : '#f4cf35';
    context.fillRect(14, -25, 8, 11);
  }
  context.restore();
}

export function renderBall(context: CanvasRenderingContext2D, ball: Ball) {
  context.save(); context.translate(ball.x, ball.y); context.rotate(ball.spin);
  context.fillStyle = '#fff'; context.shadowColor = '#0009'; context.shadowBlur = 8;
  context.beginPath(); context.arc(0, 0, ball.radius, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#18221c';
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    context.beginPath(); context.arc(Math.cos(angle) * 6, Math.sin(angle) * 6, 2.6, 0, Math.PI * 2); context.fill();
  }
  context.restore();
}

function renderAimArrow(context: CanvasRenderingContext2D, ball: Ball, aim: { x: number; y: number }) {
  context.save();
  context.translate(ball.x, ball.y);
  context.rotate(Math.atan2(aim.y, aim.x));
  context.lineCap = 'round'; context.lineJoin = 'round';
  context.beginPath();
  context.moveTo(0, 0); context.lineTo(64, 0); context.lineTo(49, -11);
  context.moveTo(64, 0); context.lineTo(49, 11);
  context.strokeStyle = '#122018'; context.lineWidth = 11; context.stroke();
  context.strokeStyle = '#fff36a'; context.lineWidth = 6;
  context.shadowColor = '#fff36a'; context.shadowBlur = 12; context.stroke();
  context.restore();
}

export function renderReferee(context: CanvasRenderingContext2D, referee: Referee) {
  context.save(); context.translate(referee.x, referee.y);
  context.fillStyle = '#ffc52b'; context.beginPath(); context.arc(0, 0, 13, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#111'; context.fillRect(-8, -3, 16, 6);
  if (referee.card) {
    context.fillStyle = referee.card === 2 ? '#ef3e35' : '#f4cf35';
    context.fillRect(11, -25, 8, 12);
  }
  context.restore();
}

export function renderMatch(
  context: CanvasRenderingContext2D,
  players: Player[],
  ball: Ball,
  referee: Referee,
  elapsed: number,
  homeTeam: number,
  awayTeam: number,
  aim: { x: number; y: number } | null,
) {
  const canvas = context.canvas;
  const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
  const offsetX = (canvas.width - FIELD.width * scale) / 2;
  const offsetY = (canvas.height - FIELD.height * scale) / 2;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save(); context.translate(offsetX, offsetY); context.scale(scale, scale);
  renderField(context);
  players.forEach((player) => renderPlayer(context, player, elapsed, player.team ? awayTeam : homeTeam));
  renderBall(context, ball);
  if (aim) renderAimArrow(context, ball, aim);
  renderReferee(context, referee);
  context.restore();
}
