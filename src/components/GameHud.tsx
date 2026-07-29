import type { MatchSnapshot } from '../game/types';

interface GameHudProps {
  match: MatchSnapshot;
  teamNames: [string, string];
  onPause: () => void;
}

export function GameHud({ match, teamNames, onPause }: GameHudProps) {
  const seconds = Math.ceil(match.seconds);
  const total = match.stats.possession[0] + match.stats.possession[1] || 1;
  const possession = Math.round(match.stats.possession[0] / total * 100);

  return (
    <header className="game-hud">
      <div className="game-hud__score">
        <span>{teamNames[0]}</span>
        <strong>{match.score[0]} : {match.score[1]}</strong>
        <span>{teamNames[1]}</span>
      </div>
      <div className="game-hud__meta">
        <b>{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</b>
        <span>Удары {match.stats.shots[0]}—{match.stats.shots[1]}</span>
        <span>Владение {possession}—{100 - possession}</span>
        <span>Фолы {match.stats.fouls[0]}—{match.stats.fouls[1]}</span>
        <button type="button" className="game-hud__pause" onClick={onPause}>Пауза</button>
      </div>
    </header>
  );
}
