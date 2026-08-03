import { Link } from 'wouter';
import type { MatchSnapshot } from '../game/types';
import { useI18n } from '../i18n/I18n';

interface MatchResultProps {
  match: MatchSnapshot;
  onRestart: () => void;
}

export function MatchResult({ match, onRestart }: MatchResultProps) {
  const { t } = useI18n();
  const title = match.score[0] === match.score[1]
    ? t('result.draw')
    : t(match.score[0] > match.score[1] ? 'result.playerWon' : 'result.opponentWon');
  const possessionTotal = match.stats.possession[0] + match.stats.possession[1] || 1;
  const rows = [
    [t('result.possession'), `${Math.round(match.stats.possession[0] / possessionTotal * 100)}%`, `${Math.round(match.stats.possession[1] / possessionTotal * 100)}%`],
    [t('result.shots'), ...match.stats.shots], [t('result.onTarget'), ...match.stats.onTarget],
    [t('result.passes'), ...match.stats.passes],
    [t('result.accuracy'), ...match.stats.passAttempts.map((value, team) => value ? `${Math.round(match.stats.passes[team] / value * 100)}%` : '0%')],
    [t('result.fouls'), ...match.stats.fouls], [t('result.cards'), ...match.stats.cards],
    [t('result.offsides'), ...match.stats.offsides],
  ];

  return (
    <section className="match-modal match-modal--result">
      <p className="eyebrow">{t('result.finalWhistle')}</p>
      <h2>{title}</h2>
      <strong className="match-modal__score">{match.score[0]} — {match.score[1]}</strong>
      <div className="result-stats">
        {rows.map(([name, home, away]) => <div key={name}><b>{home}</b><span>{name}</span><b>{away}</b></div>)}
      </div>
      <p className="player-of-match">{t('result.playerOfMatch')}</p>
      <div className="match-modal__actions">
        <button type="button" onClick={onRestart}>{t('result.playAgain')}</button>
        <Link href="/" className="secondary-button">{t('result.mainMenu')}</Link>
      </div>
    </section>
  );
}
