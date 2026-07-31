import { FIELD, TEAMS } from './config';
import type { Ball } from './Ball';
import type { Player } from './Player';
import type { Referee } from './Referee';

export function renderField(context: CanvasRenderingContext2D) {
  const { width, height, margin, goalWidth } = FIELD;
  const grass = context.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * .7);
  grass.addColorStop(0, '#237342'); grass.addColorStop(.72, '#155632'); grass.addColorStop(1, '#0b3524');
  context.fillStyle = grass;
  context.fillRect(0, 0, width, height);
  for (let x = margin; x < width - margin; x += 86) {
    context.fillStyle = Math.floor((x - margin) / 86) % 2 ? '#0d3d241f' : '#53a06812';
    context.fillRect(x, margin, 86, height - margin * 2);
  }
  renderGoalNet(context, 'left', margin, height / 2, goalWidth);
  renderGoalNet(context, 'right', width - margin, height / 2, goalWidth);
  context.strokeStyle = '#f5faec';
  context.lineWidth = 3;
  context.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  context.beginPath(); context.moveTo(width / 2, margin); context.lineTo(width / 2, height - margin); context.stroke();
  context.beginPath(); context.arc(width / 2, height / 2, 92, 0, Math.PI * 2); context.stroke();
  context.fillStyle = '#f5faec'; context.beginPath(); context.arc(width / 2, height / 2, 4, 0, Math.PI * 2); context.fill();
  context.strokeRect(margin, 155, 190, 390);
  context.strokeRect(width - margin - 190, 155, 190, 390);
  context.strokeRect(margin, 240, 66, 220);
  context.strokeRect(width - margin - 66, 240, 66, 220);
  const goalTop = (height - goalWidth) / 2;
  context.fillStyle = '#fff';
  for (const x of [margin, width - margin]) {
    for (const y of [goalTop, goalTop + goalWidth]) {
      context.beginPath(); context.arc(x, y, 7, 0, Math.PI * 2); context.fill();
    }
  }
  for (const x of [margin, width - margin]) {
    context.beginPath(); context.arc(x + (x === margin ? 132 : -132), height / 2, 3.5, 0, Math.PI * 2); context.fill();
  }
  for (const [x, y, start, end] of [
    [margin, margin, 0, Math.PI / 2], [width - margin, margin, Math.PI / 2, Math.PI],
    [margin, height - margin, -Math.PI / 2, 0], [width - margin, height - margin, Math.PI, Math.PI * 1.5],
  ]) {
    context.beginPath(); context.arc(x, y, 18, start, end); context.stroke();
  }
}

function renderGoalNet(context: CanvasRenderingContext2D, side: 'left' | 'right', lineX: number, centerY: number, goalWidth: number) {
  const direction = side === 'left' ? -1 : 1;
  const backX = lineX + direction * 38, top = centerY - goalWidth / 2, bottom = centerY + goalWidth / 2;
  context.save();
  context.fillStyle = '#061c15b8'; context.beginPath();
  context.moveTo(lineX, top); context.lineTo(backX, top + 9); context.lineTo(backX, bottom - 9); context.lineTo(lineX, bottom);
  context.closePath(); context.fill();
  context.strokeStyle = '#e9f5edaa'; context.lineWidth = 1;
  for (let y = top + 10; y < bottom; y += 14) {
    context.beginPath(); context.moveTo(lineX, y); context.lineTo(backX, y + direction * 2); context.stroke();
  }
  for (let step = 0; step <= 4; step++) {
    const x = lineX + direction * step * 9;
    context.beginPath(); context.moveTo(x, top + step * 2); context.lineTo(x, bottom - step * 2); context.stroke();
  }
  context.strokeStyle = '#f3faf5'; context.lineWidth = 4; context.beginPath();
  context.moveTo(lineX, top); context.lineTo(backX, top + 9); context.lineTo(backX, bottom - 9);
  context.lineTo(lineX, bottom); context.stroke(); context.restore();
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
  context.strokeStyle = '#ffffffd9'; context.lineWidth = 2;
  context.beginPath(); context.arc(0, 0, Math.max(3, player.radius - 4), 0, Math.PI * 2); context.stroke();
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
