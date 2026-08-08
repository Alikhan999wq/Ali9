import { TEAMS } from './config';
import type { MapConfig } from './maps';
import { renderField } from './FieldRenderer';
import type { Ball } from './Ball';
import type { Player } from './Player';
import type { Referee } from './Referee';

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
  context.strokeStyle = '#ffffffd9'; context.lineWidth = 2;
  context.beginPath(); context.arc(0, 0, Math.max(3, player.radius - 4), 0, Math.PI * 2); context.stroke();
  context.fillStyle = '#fff'; context.font = '700 13px Inter'; context.textAlign = 'center';
  context.fillText(String(player.number), 0, 5);
  if (player.controlled) {
    context.save();
    context.shadowColor = '#eaff5c'; context.shadowBlur = 14;
    context.strokeStyle = '#efff67'; context.lineWidth = 3;
    context.beginPath(); context.arc(0, 0, player.radius + 7, 0, Math.PI * 2); context.stroke();
    context.fillStyle = '#efff67'; context.beginPath();
    context.moveTo(-10, -37); context.lineTo(10, -37); context.lineTo(0, -24); context.closePath(); context.fill();
    context.restore();
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
  map: MapConfig,
) {
  const canvas = context.canvas;
  const { width, height } = map.field;
  const scale = Math.min(canvas.width / width, canvas.height / height);
  const offsetX = (canvas.width - width * scale) / 2;
  const offsetY = (canvas.height - height * scale) / 2;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save(); context.translate(offsetX, offsetY); context.scale(scale, scale);
  renderField(context, map);
  players.forEach((player) => renderPlayer(context, player, elapsed, player.team ? awayTeam : homeTeam));
  renderBall(context, ball);
  if (aim) renderAimArrow(context, ball, aim);
  renderReferee(context, referee);
  context.restore();
}
