import { useEffect, useState } from 'react';
import type { MatchOptions } from '../game/types';
import { useI18n, type Language } from '../i18n/I18n';

interface PauseSettingsProps {
  options: MatchOptions;
  language: Language;
  onOptionChange: <Key extends keyof MatchOptions>(key: Key, value: MatchOptions[Key]) => void;
  onLanguageChange: (language: Language) => void;
  onClose: () => void;
}

export function PauseSettings({ options, language, onOptionChange, onLanguageChange, onClose }: PauseSettingsProps) {
  const { t } = useI18n();
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  };

  return (
    <div className="pause-settings-overlay">
      <section className="pause-settings" role="dialog" aria-modal="true" aria-labelledby="pause-settings-title">
        <header>
          <div><p className="eyebrow">{t('pause.settingsEyebrow')}</p><h2 id="pause-settings-title">{t('settings.title')}</h2></div>
          <button type="button" className="pause-settings__close" onClick={onClose} aria-label={t('pause.closeSettings')}>×</button>
        </header>
        <div className="pause-settings__list">
          <VolumeControl label={t('settings.gameSounds')} value={options.volume} onChange={(value) => {
            onOptionChange('volume', value);
            if (!options.effectsEnabled) onOptionChange('effectsEnabled', true);
          }} />
          <VolumeControl label={t('pause.commentator')} value={options.commentaryVolume} disabled={!options.commentaryEnabled} onChange={(value) => onOptionChange('commentaryVolume', value)} />
          <VolumeControl label={t('pause.fans')} value={options.crowdVolume} onChange={(value) => {
            onOptionChange('crowdVolume', value);
            if (!options.crowdEnabled) onOptionChange('crowdEnabled', true);
          }} />
          <label className="pause-settings__row pause-settings__toggle">
            <span>{t('pause.voice')}</span>
            <input type="checkbox" checked={options.commentaryEnabled} onChange={(event) => onOptionChange('commentaryEnabled', event.target.checked)} />
          </label>
          <label className="pause-settings__row pause-settings__toggle">
            <span>{t('settings.autoSwitch')}</span>
            <input type="checkbox" checked={options.autoSwitch} onChange={(event) => onOptionChange('autoSwitch', event.target.checked)} />
          </label>
          <label className="pause-settings__row">
            <span>{t('settings.language')}</span>
            <select value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
              <option value="ru">Русский</option><option value="en">English</option>
            </select>
          </label>
          <button type="button" className="pause-settings__fullscreen" onClick={() => void toggleFullscreen()}>
            {fullscreen ? t('settings.exitFullscreen') : t('settings.fullscreen')}
          </button>
        </div>
        <button type="button" className="pause-settings__done" onClick={onClose}>{t('pause.done')}</button>
      </section>
    </div>
  );
}

function VolumeControl({ label, value, disabled = false, onChange }: { label: string; value: number; disabled?: boolean; onChange: (value: number) => void }) {
  return (
    <label className="pause-settings__row pause-settings__volume">
      <span>{label}<b>{Math.round(value * 100)}%</b></span>
      <input type="range" min="0" max="1" step=".05" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
