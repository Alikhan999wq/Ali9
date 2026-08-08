import type { MapConfig } from './maps';

export function renderField(context: CanvasRenderingContext2D, map: MapConfig) {
  const { width, height, margin, goalWidth, goalDepth, postRadius } = map.field;
  const surface = context.createRadialGradient(width / 2, height / 2, 80, width / 2, height / 2, width * .72);
  surface.addColorStop(0, map.palette.surfaceLight); surface.addColorStop(.7, map.palette.surface); surface.addColorStop(1, map.palette.surfaceDark);
  context.fillStyle = map.palette.background; context.fillRect(0, 0, width, height);
  renderDecorations(context, map);
  context.fillStyle = surface; context.fillRect(margin, margin, width - margin * 2, height - margin * 2);
  renderSurfaceTexture(context, map);
  renderGoalNet(context, 'left', margin, height / 2, goalWidth, goalDepth, map.palette.net);
  renderGoalNet(context, 'right', width - margin, height / 2, goalWidth, goalDepth, map.palette.net);
  context.strokeStyle = map.palette.line; context.lineWidth = map.surface === 'night' ? 4 : 3;
  context.shadowColor = map.surface === 'night' ? map.palette.line : 'transparent';
  context.shadowBlur = map.surface === 'night' ? 8 : 0;
  context.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  context.beginPath(); context.moveTo(width / 2, margin); context.lineTo(width / 2, height - margin); context.stroke();
  const circleRadius = Math.min(width, height) * .13;
  context.beginPath(); context.arc(width / 2, height / 2, circleRadius, 0, Math.PI * 2); context.stroke();
  context.fillStyle = map.palette.line; context.beginPath(); context.arc(width / 2, height / 2, 4, 0, Math.PI * 2); context.fill();
  renderBoxes(context, map);
  const goalTop = (height - goalWidth) / 2;
  context.fillStyle = map.palette.line;
  for (const x of [margin, width - margin]) for (const y of [goalTop, goalTop + goalWidth]) {
    context.beginPath(); context.arc(x, y, postRadius, 0, Math.PI * 2); context.fill();
  }
  for (const x of [margin, width - margin]) {
    context.beginPath(); context.arc(x + (x === margin ? width * .11 : -width * .11), height / 2, 3.5, 0, Math.PI * 2); context.fill();
  }
  if (!map.simplifiedMarkings) for (const [x, y, start, end] of [
    [margin, margin, 0, Math.PI / 2], [width - margin, margin, Math.PI / 2, Math.PI],
    [margin, height - margin, -Math.PI / 2, 0], [width - margin, height - margin, Math.PI, Math.PI * 1.5],
  ]) {
    context.beginPath(); context.arc(x, y, 18, start, end); context.stroke();
  }
  context.shadowBlur = 0;
}

function renderBoxes(context: CanvasRenderingContext2D, map: MapConfig) {
  if (map.simplifiedMarkings) return;
  const { width, height, margin, goalWidth } = map.field;
  const boxHeight = Math.min(height - margin * 2 - 34, goalWidth * 1.7);
  const boxTop = (height - boxHeight) / 2;
  const boxDepth = width * .16;
  const goalBoxHeight = Math.min(boxHeight * .56, goalWidth * .98);
  const goalBoxTop = (height - goalBoxHeight) / 2;
  context.strokeRect(margin, boxTop, boxDepth, boxHeight);
  context.strokeRect(width - margin - boxDepth, boxTop, boxDepth, boxHeight);
  context.strokeRect(margin, goalBoxTop, boxDepth * .35, goalBoxHeight);
  context.strokeRect(width - margin - boxDepth * .35, goalBoxTop, boxDepth * .35, goalBoxHeight);
}

function renderSurfaceTexture(context: CanvasRenderingContext2D, map: MapConfig) {
  const { width, height, margin } = map.field;
  context.save(); context.globalAlpha = map.surface === 'wood' ? .3 : .14;
  if (map.surface === 'wood') {
    for (let y = margin; y < height - margin; y += 24) {
      context.fillStyle = Math.floor((y - margin) / 24) % 2 ? map.palette.surfaceDark : map.palette.surfaceLight;
      context.fillRect(margin, y, width - margin * 2, 2);
    }
    for (let x = margin + 90; x < width - margin; x += 120) context.fillRect(x, margin, 2, height - margin * 2);
  } else if (map.surface === 'sand') {
    context.fillStyle = map.palette.surfaceDark;
    for (let x = margin + 18; x < width - margin; x += 38) for (let y = margin + 14; y < height - margin; y += 31) {
      context.beginPath(); context.arc(x + (y % 13), y, 1.4, 0, Math.PI * 2); context.fill();
    }
  } else {
    const stripe = Math.max(62, (width - margin * 2) / 12);
    for (let x = margin; x < width - margin; x += stripe) {
      context.fillStyle = Math.floor((x - margin) / stripe) % 2 ? map.palette.surfaceDark : map.palette.surfaceLight;
      context.fillRect(x, margin, stripe, height - margin * 2);
    }
  }
  context.restore();
}

function renderDecorations(context: CanvasRenderingContext2D, map: MapConfig) {
  const { width, height, margin } = map.field;
  context.save();
  if (map.decoration === 'beach') {
    context.fillStyle = '#55b9d0'; context.fillRect(0, 0, width, margin * .48);
    context.fillStyle = '#f2d58d'; context.fillRect(0, margin * .48, width, margin * .52);
    ['#ff6767', '#ffe15b', '#55d08c'].forEach((color, index) => {
      context.fillStyle = color; context.beginPath(); context.arc(width * (.2 + index * .3), margin * .58, 14, Math.PI, 0); context.fill();
    });
  } else {
    context.fillStyle = map.decoration === 'wooden' ? '#3b2115' : '#101713';
    context.fillRect(0, 0, width, margin); context.fillRect(0, height - margin, width, margin);
    const seats = map.decoration === 'professional' ? 16 : 24;
    for (let x = 12; x < width; x += seats) {
      context.fillStyle = (Math.floor(x / seats) % 3 === 0) ? map.palette.accent : '#647069';
      context.beginPath(); context.arc(x, margin * .48, 3, 0, Math.PI * 2); context.fill();
      context.beginPath(); context.arc(x + 7, height - margin * .48, 3, 0, Math.PI * 2); context.fill();
    }
  }
  if (map.decoration === 'floodlights' || map.decoration === 'professional') {
    context.fillStyle = '#efffff'; context.shadowColor = '#b9f7ff'; context.shadowBlur = 22;
    for (const x of [margin * .55, width - margin * .55]) for (const y of [margin * .38, height - margin * .38]) context.fillRect(x - 18, y - 5, 36, 10);
  }
  context.restore();
}

function renderGoalNet(context: CanvasRenderingContext2D, side: 'left' | 'right', lineX: number, centerY: number, goalWidth: number, goalDepth: number, netColor: string) {
  const direction = side === 'left' ? -1 : 1;
  const backX = lineX + direction * goalDepth, top = centerY - goalWidth / 2, bottom = centerY + goalWidth / 2;
  context.save(); context.fillStyle = '#06100db8'; context.beginPath();
  context.moveTo(lineX, top); context.lineTo(backX, top + 9); context.lineTo(backX, bottom - 9); context.lineTo(lineX, bottom);
  context.closePath(); context.fill(); context.strokeStyle = netColor; context.globalAlpha = .72; context.lineWidth = 1;
  for (let y = top + 10; y < bottom; y += 14) { context.beginPath(); context.moveTo(lineX, y); context.lineTo(backX, y + direction * 2); context.stroke(); }
  for (let step = 0; step <= 4; step++) {
    const x = lineX + direction * step * goalDepth / 4;
    context.beginPath(); context.moveTo(x, top + step * 2); context.lineTo(x, bottom - step * 2); context.stroke();
  }
  context.globalAlpha = 1; context.strokeStyle = netColor; context.lineWidth = 4; context.beginPath();
  context.moveTo(lineX, top); context.lineTo(backX, top + 9); context.lineTo(backX, bottom - 9); context.lineTo(lineX, bottom); context.stroke(); context.restore();
}
