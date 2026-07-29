import { Link } from 'wouter';
import { TEAMS, type Difficulty, type Quality } from '../game/config';
import type { MatchOptions } from '../game/types';

interface GameSetupProps {
  options: MatchOptions;
  language: 'ru' | 'en';
  onOptions: (options: MatchOptions) => void;
  onLanguage: (language: 'ru' | 'en') => void;
  onStart: () => void;
}

export function GameSetup({ options, language, onOptions, onLanguage, onStart }: GameSetupProps) {
  const text = language === 'ru'
    ? { back: 'На главную', intro: 'Выбери команду и сыграй быстрый 90-секундный матч.', difficulty: 'Сложность', quality: 'Качество', volume: 'Громкость', start: 'Начать матч' }
    : { back: 'Home', intro: 'Choose a team and play a fast 90-second match.', difficulty: 'Difficulty', quality: 'Quality', volume: 'Volume', start: 'Start match' };
  const update = <K extends keyof MatchOptions>(key: K, value: MatchOptions[K]) => {
    const next = { ...options, [key]: value };
    localStorage.setItem(`game-${key}`, String(value));
    onOptions(next);
  };

  return (
    <main className="game-menu">
      <Link href="/" className="back-link">← {text.back}</Link>
      <p className="eyebrow">ARCADE FOOTBALL</p>
      <h1>Touchline <em>90</em></h1>
      <p>{text.intro}</p>
      <div className="team-picker">
        {TEAMS.map((team, index) => (
          <button key={team.name} className={options.team === index ? 'team-card team-card--active' : 'team-card'} onClick={() => update('team', index)}>
            <span style={{ background: team.primary }}>{team.short}</span><b>{team.name}</b>
          </button>
        ))}
      </div>
      <div className="game-settings">
        <label>{text.difficulty}<select value={options.difficulty} onChange={(event) => update('difficulty', event.target.value as Difficulty)}>
          <option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option>
        </select></label>
        <label>{text.quality}<select value={options.quality} onChange={(event) => update('quality', Number(event.target.value) as Quality)}>
          <option value="1">Performance</option><option value="1.5">Balanced</option><option value="2">High</option>
        </select></label>
        <label>{text.volume}<input type="range" min="0" max="1" step=".05" value={options.volume} onChange={(event) => update('volume', Number(event.target.value))} /></label>
        <label>Language<select value={language} onChange={(event) => onLanguage(event.target.value as 'ru' | 'en')}>
          <option value="ru">Русский</option><option value="en">English</option>
        </select></label>
      </div>
      <button type="button" className="play-button" onClick={onStart}>{text.start}</button>
      <button type="button" className="fullscreen-button" onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}>
        Полноэкранный режим
      </button>
      <small>WASD · Space · Shift + Space · P</small>
    </main>
  );
}
