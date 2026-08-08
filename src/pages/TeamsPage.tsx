import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'wouter';
import { MenuScreen } from '../components/MenuScreen';
import { TEAMS } from '../game/config';
import { useI18n } from '../i18n/I18n';

export function TeamsPage() {
  const { t } = useI18n();
  const saved = Number(localStorage.getItem('game-team'));
  const [selected, setSelected] = useState<number | null>(
    Number.isInteger(saved) && saved >= 0 && saved < TEAMS.length ? saved : null,
  );

  const select = (team: number) => {
    setSelected(team);
    localStorage.setItem('game-team', String(team));
  };

  return (
    <MenuScreen eyebrow={t('teams.eyebrow')} title={t('teams.title')} wide showBack={false}>
      <div className="teams-grid">
        {TEAMS.map((team, index) => (
          <article key={team.id} className={selected === index ? 'club-card club-card--active' : 'club-card'}>
            <div className="club-card__top">
              <div className="club-crest" style={{ '--club-primary': team.primary, '--club-secondary': team.secondary } as CSSProperties}>
                <span>{team.symbol}</span><b>{team.short}</b>
              </div>
              <div><h2>{team.name}</h2><p>{t(team.descriptionKey)}</p></div>
            </div>
            <div className="club-kits">
              <span>{t('teams.kit')}</span>
              <i title={t('teams.homeKit')} style={{ '--shirt': team.primary, '--trim': team.secondary } as CSSProperties} />
              <i title={t('teams.awayKit')} style={{ '--shirt': team.away, '--trim': team.primary } as CSSProperties} />
            </div>
            <button type="button" onClick={() => select(index)}>
              {selected === index ? t('teams.selected') : t('teams.select')}
            </button>
          </article>
        ))}
      </div>
      <div className="teams-actions">
        <Link href="/" className="teams-back">← {t('common.back')}</Link>
        {selected !== null && <Link href="/maps" className="teams-start">{t('teams.start')} →</Link>}
      </div>
    </MenuScreen>
  );
}
