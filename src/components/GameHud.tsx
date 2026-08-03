import type { MatchSnapshot } from '../game/types';
import { useI18n } from '../i18n/I18n';

interface GameHudProps {
  match: MatchSnapshot;
  teamNames: [string, string];
  teamSymbols: [string, string];
  onPause: () => void;
}

export function GameHud({ match, teamNames, teamSymbols, onPause }: GameHudProps) {
  const { t } = useI18n();
  const seconds = Math.ceil(match.seconds);
  const total = match.stats.possession[0] + match.stats.possession[1] || 1;
  const possession = Math.round(match.stats.possession[0] / total * 100);

  return (
    <header className="game-hud">
      <div className="game-hud__main">
        <time className="game-hud__timer" aria-label={t('hud.timer')}>
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
        </time>
        <div className="game-hud__score" aria-label={t('hud.score')}>
          <span className="game-hud__team" title={teamNames[0]}><i>{teamSymbols[0]}</i><b>{teamNames[0]}</b></span>
          <strong>{match.score[0]} : {match.score[1]}</strong>
          <span className="game-hud__team game-hud__team--away" title={teamNames[1]}><b>{teamNames[1]}</b><i>{teamSymbols[1]}</i></span>
        </div>
        <button type="button" className="game-hud__pause" onClick={onPause}><span>Ⅱ</span> {t('hud.pause')}</button>
      </div>
      <div className="game-hud__meta">
        <span>{t('hud.shots')} {match.stats.shots[0]}–{match.stats.shots[1]}</span><i />
        <span>{t('hud.possession')} {possession}–{100 - possession}%</span><i />
        <span>{t('hud.fouls')} {match.stats.fouls[0]}–{match.stats.fouls[1]}</span>
      </div>
    </header>
  );
}
