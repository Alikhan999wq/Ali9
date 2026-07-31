import { Link } from 'wouter';
import type { MatchSnapshot } from '../game/types';

interface MatchResultProps {
  match: MatchSnapshot;
  onRestart: () => void;
}

export function MatchResult({ match, onRestart }: MatchResultProps) {
  const title = match.score[0] === match.score[1]
    ? 'Ничья'
    : `Победила команда ${match.score[0] > match.score[1] ? 'игрока' : 'соперника'}`;
  const possessionTotal = match.stats.possession[0] + match.stats.possession[1] || 1;
  const rows = [
    ['Владение', `${Math.round(match.stats.possession[0] / possessionTotal * 100)}%`, `${Math.round(match.stats.possession[1] / possessionTotal * 100)}%`],
    ['Удары', ...match.stats.shots], ['В створ', ...match.stats.onTarget],
    ['Передачи', ...match.stats.passes],
    ['Точность', ...match.stats.passAttempts.map((value, team) => value ? `${Math.round(match.stats.passes[team] / value * 100)}%` : '0%')],
    ['Фолы', ...match.stats.fouls], ['Карточки', ...match.stats.cards],
    ['Офсайды', ...match.stats.offsides],
  ];

  return (
    <section className="match-modal match-modal--result">
      <p className="eyebrow">ФИНАЛЬНЫЙ СВИСТОК</p>
      <h2>{title}</h2>
      <strong className="match-modal__score">{match.score[0]} — {match.score[1]}</strong>
      <div className="result-stats">
        {rows.map(([name, home, away]) => <div key={name}><b>{home}</b><span>{name}</span><b>{away}</b></div>)}
      </div>
      <p className="player-of-match">Игрок матча: №7</p>
      <div className="match-modal__actions">
        <button type="button" onClick={onRestart}>Играть снова</button>
        <Link href="/" className="secondary-button">Главное меню</Link>
      </div>
    </section>
  );
}
