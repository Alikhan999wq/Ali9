import { useState } from 'react';
import { MenuScreen } from '../components/MenuScreen';
import type { Difficulty, Quality } from '../game/config';
import { useI18n, type Language } from '../i18n/I18n';

export function SettingsPage() {
  const { language, setLanguage, t } = useI18n();
  const [music, setMusic] = useState(Number(localStorage.getItem('game-music-volume') || .4));
  const [effects, setEffects] = useState(Number(localStorage.getItem('game-volume') || .65));
  const [quality, setQuality] = useState<Quality>(Number(localStorage.getItem('game-quality') || 1.5) as Quality);
  const [difficulty, setDifficulty] = useState<Difficulty>((localStorage.getItem('game-difficulty') || 'normal') as Difficulty);
  const [commentary, setCommentary] = useState(localStorage.getItem('game-commentary') !== 'false');
  const [commentaryVolume, setCommentaryVolume] = useState(Number(localStorage.getItem('game-commentary-volume') || .75));
  const [crowdVolume, setCrowdVolume] = useState(Number(localStorage.getItem('game-crowd-volume') || .65));
  const [crowdEnabled, setCrowdEnabled] = useState(localStorage.getItem('game-crowd-enabled') !== 'false');
  const [effectsEnabled, setEffectsEnabled] = useState(localStorage.getItem('game-effects-enabled') !== 'false');

  const save = (key: string, value: string | number | boolean) => localStorage.setItem(key, String(value));

  return (
    <MenuScreen eyebrow={t('settings.eyebrow')} title={t('settings.title')}>
      <div className="settings-list">
        <label>{t('settings.musicVolume')} <input type="range" min="0" max="1" step=".05" value={music} onChange={(event) => { const value = Number(event.target.value); setMusic(value); save('game-music-volume', value); }} /></label>
        <label>{t('settings.gameVolume')} <input type="range" min="0" max="1" step=".05" value={effects} disabled={!effectsEnabled} onChange={(event) => { const value = Number(event.target.value); setEffects(value); save('game-volume', value); }} /></label>
        <label>{t('settings.commentaryVolume')} <input type="range" min="0" max="1" step=".05" value={commentaryVolume} disabled={!commentary} onChange={(event) => { const value = Number(event.target.value); setCommentaryVolume(value); save('game-commentary-volume', value); }} /></label>
        <label>{t('settings.crowdVolume')} <input type="range" min="0" max="1" step=".05" value={crowdVolume} disabled={!crowdEnabled} onChange={(event) => { const value = Number(event.target.value); setCrowdVolume(value); save('game-crowd-volume', value); }} /></label>
        <label>{t('settings.language')} <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
          <option value="ru">Русский</option><option value="en">English</option>
        </select></label>
        <label>{t('settings.quality')} <select value={quality} onChange={(event) => { const value = Number(event.target.value) as Quality; setQuality(value); save('game-quality', value); }}>
          <option value="1">{t('settings.performance')}</option><option value="1.5">{t('settings.balanced')}</option><option value="2">{t('settings.high')}</option>
        </select></label>
        <label>{t('settings.difficulty')} <select value={difficulty} onChange={(event) => { const value = event.target.value as Difficulty; setDifficulty(value); save('game-difficulty', value); }}>
          <option value="easy">{t('settings.easy')}</option><option value="normal">{t('settings.normal')}</option><option value="hard">{t('settings.hard')}</option>
        </select></label>
        <label>{t('settings.voice')} <input type="checkbox" checked={commentary} onChange={(event) => { setCommentary(event.target.checked); save('game-commentary', event.target.checked); }} /></label>
        <label>{t('settings.crowd')} <input type="checkbox" checked={crowdEnabled} onChange={(event) => { setCrowdEnabled(event.target.checked); save('game-crowd-enabled', event.target.checked); }} /></label>
        <label>{t('settings.gameSounds')} <input type="checkbox" checked={effectsEnabled} onChange={(event) => { setEffectsEnabled(event.target.checked); save('game-effects-enabled', event.target.checked); }} /></label>
        <button type="button" className="settings-fullscreen" onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}>
          {t('settings.fullscreen')}
        </button>
      </div>
    </MenuScreen>
  );
}
