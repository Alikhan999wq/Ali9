import { useState } from 'react';
import { MenuScreen } from '../components/MenuScreen';
import type { Difficulty, Quality } from '../game/config';

export function SettingsPage() {
  const [music, setMusic] = useState(Number(localStorage.getItem('game-music-volume') || .4));
  const [effects, setEffects] = useState(Number(localStorage.getItem('game-volume') || .65));
  const [language, setLanguage] = useState(localStorage.getItem('game-language') || 'ru');
  const [quality, setQuality] = useState<Quality>(Number(localStorage.getItem('game-quality') || 1.5) as Quality);
  const [difficulty, setDifficulty] = useState<Difficulty>((localStorage.getItem('game-difficulty') || 'normal') as Difficulty);
  const [commentary, setCommentary] = useState(localStorage.getItem('game-commentary') !== 'false');
  const [commentaryVolume, setCommentaryVolume] = useState(Number(localStorage.getItem('game-commentary-volume') || .75));
  const [crowdVolume, setCrowdVolume] = useState(Number(localStorage.getItem('game-crowd-volume') || .65));
  const [crowdEnabled, setCrowdEnabled] = useState(localStorage.getItem('game-crowd-enabled') !== 'false');
  const [effectsEnabled, setEffectsEnabled] = useState(localStorage.getItem('game-effects-enabled') !== 'false');

  const save = (key: string, value: string | number | boolean) => localStorage.setItem(key, String(value));

  return (
    <MenuScreen eyebrow="ПАРАМЕТРЫ ИГРЫ" title="Настройки">
      <div className="settings-list">
        <label>Громкость музыки <input type="range" min="0" max="1" step=".05" value={music} onChange={(event) => { const value = Number(event.target.value); setMusic(value); save('game-music-volume', value); }} /></label>
        <label>Громкость игровых звуков <input type="range" min="0" max="1" step=".05" value={effects} disabled={!effectsEnabled} onChange={(event) => { const value = Number(event.target.value); setEffects(value); save('game-volume', value); }} /></label>
        <label>Громкость комментатора <input type="range" min="0" max="1" step=".05" value={commentaryVolume} disabled={!commentary} onChange={(event) => { const value = Number(event.target.value); setCommentaryVolume(value); save('game-commentary-volume', value); }} /></label>
        <label>Громкость атмосферы стадиона <input type="range" min="0" max="1" step=".05" value={crowdVolume} disabled={!crowdEnabled} onChange={(event) => { const value = Number(event.target.value); setCrowdVolume(value); save('game-crowd-volume', value); }} /></label>
        <label>Язык <select value={language} onChange={(event) => { setLanguage(event.target.value); save('game-language', event.target.value); }}>
          <option value="ru">Русский</option><option value="en">English</option>
        </select></label>
        <label>Разрешение экрана <select value={quality} onChange={(event) => { const value = Number(event.target.value) as Quality; setQuality(value); save('game-quality', value); }}>
          <option value="1">Производительность</option><option value="1.5">Сбалансированное</option><option value="2">Высокое</option>
        </select></label>
        <label>Сложность ИИ <select value={difficulty} onChange={(event) => { const value = event.target.value as Difficulty; setDifficulty(value); save('game-difficulty', value); }}>
          <option value="easy">Лёгкая</option><option value="normal">Средняя</option><option value="hard">Сложная</option>
        </select></label>
        <label>Голосовой комментатор <input type="checkbox" checked={commentary} onChange={(event) => { setCommentary(event.target.checked); save('game-commentary', event.target.checked); }} /></label>
        <label>Атмосфера стадиона <input type="checkbox" checked={crowdEnabled} onChange={(event) => { setCrowdEnabled(event.target.checked); save('game-crowd-enabled', event.target.checked); }} /></label>
        <label>Игровые звуки <input type="checkbox" checked={effectsEnabled} onChange={(event) => { setEffectsEnabled(event.target.checked); save('game-effects-enabled', event.target.checked); }} /></label>
        <button type="button" className="settings-fullscreen" onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}>
          Полноэкранный режим
        </button>
      </div>
    </MenuScreen>
  );
}
