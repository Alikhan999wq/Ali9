import { Player } from './Player';
import type { FieldGeometry } from './maps';

export function createPlayers(field: FieldGeometry) {
  const layout = [[-.3, 0], [-.13, -.28], [-.13, .28], [.12, -.2], [.12, .2]];
  const players: Player[] = [];
  const centerX = field.width / 2;
  const centerY = field.height / 2;
  layout.forEach(([x, y], index) =>
    players.push(new Player(centerX + x * field.width, centerY + y * field.height, centerX + x * field.width, centerY + y * field.height, 0, index + 7, index, index === 0, field)));
  layout.forEach(([x, y], index) =>
    players.push(new Player(centerX - x * field.width, centerY + y * field.height, centerX - x * field.width, centerY + y * field.height, 1, index + 7, index + 5, false, field)));
  return players;
}
