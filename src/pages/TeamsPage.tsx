import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'wouter';
import { MenuScreen } from '../components/MenuScreen';
import { TEAMS } from '../game/config';

export function TeamsPage() {
  const saved = Number(localStorage.getItem('game-team'));
  const [selected, setSelected] = useState<number | null>(
    Number.isInteger(saved) && saved >= 0 && saved < TEAMS.length ? saved : null,
  );

  const select = (team: number) => {
    setSelected(team);
    localStorage.setItem('game-team', String(team));
  };

  return (
    <MenuScreen eyebrow="СОСТАВ НА МАТЧ" title="Выбор команды" wide showBack={false}>
      <div className="teams-grid">
        {TEAMS.map((team, index) => (
          <article key={team.id} className={selected === index ? 'club-card club-card--active' : 'club-card'}>
            <div className="club-card__top">
              <div className="club-crest" style={{ '--club-primary': team.primary, '--club-secondary': team.secondary } as CSSProperties}>
                <span>{team.symbol}</span><b>{team.short}</b>
              </div>
              <div><h2>{team.name}</h2><p>{team.description}</p></div>
            </div>
            <div className="club-kits">
              <span>ФОРМА</span>
              <i title="Домашняя форма" style={{ '--shirt': team.primary, '--trim': team.secondary } as CSSProperties} />
              <i title="Гостевая форма" style={{ '--shirt': team.away, '--trim': team.primary } as CSSProperties} />
            </div>
            <button type="button" onClick={() => select(index)}>
              {selected === index ? 'ВЫБРАНА' : 'ВЫБРАТЬ'}
            </button>
          </article>
        ))}
      </div>
      <div className="teams-actions">
        <Link href="/" className="teams-back">← НАЗАД</Link>
        {selected !== null && <Link href="/game" className="teams-start">НАЧАТЬ МАТЧ →</Link>}
      </div>
    </MenuScreen>
  );
}
