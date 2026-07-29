import { Player } from './Player';

export function createPlayers() {
  const layout = [[-.3, 0], [-.13, -.28], [-.13, .28], [.12, -.2], [.12, .2]];
  const players: Player[] = [];
  layout.forEach(([x, y], index) =>
    players.push(new Player(600 + x * 1200, 350 + y * 700, 600 + x * 1200, 350 + y * 700, 0, index + 7, index, index === 0)));
  layout.forEach(([x, y], index) =>
    players.push(new Player(600 - x * 1200, 350 + y * 700, 600 - x * 1200, 350 + y * 700, 1, index + 7, index + 5)));
  return players;
}
