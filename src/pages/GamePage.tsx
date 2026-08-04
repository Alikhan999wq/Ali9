import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameCanvas, type GameCanvasHandle } from '../components/GameCanvas';
import { GameHud } from '../components/GameHud';
import { MatchEventOverlay } from '../components/MatchEventOverlay';
import { MatchResult } from '../components/MatchResult';
import { MobileControls } from '../components/MobileControls';
import { PauseMenu } from '../components/PauseMenu';
import { PauseSettings } from '../components/PauseSettings';
import { MATCH_SECONDS, TEAMS, type Difficulty, type Quality } from '../game/config';
import type { MatchOptions, MatchSnapshot } from '../game/types';
import { useI18n } from '../i18n/I18n';

const initialMatch = (): MatchSnapshot => ({
  state: 'playing', score: [0, 0], seconds: MATCH_SECONDS, event: null,
  stats: {
    shots: [0, 0], onTarget: [0, 0], possession: [0, 0], passes: [0, 0],
    passAttempts: [0, 0], fouls: [0, 0], cards: [0, 0], offsides: [0, 0],
  },
});

const loadOptions = (language: MatchOptions['language']): MatchOptions => ({
  team: Math.max(0, Math.min(TEAMS.length - 1, Number(localStorage.getItem('game-team') || 0))),
  difficulty: (localStorage.getItem('game-difficulty') || 'normal') as Difficulty,
  volume: Number(localStorage.getItem('game-volume') || .65),
  effectsEnabled: localStorage.getItem('game-effects-enabled') !== 'false',
  commentaryVolume: Number(localStorage.getItem('game-commentary-volume') || .75),
  commentaryEnabled: localStorage.getItem('game-commentary') !== 'false',
  crowdVolume: Number(localStorage.getItem('game-crowd-volume') || .65),
  crowdEnabled: localStorage.getItem('game-crowd-enabled') !== 'false',
  quality: Number(localStorage.getItem('game-quality') || 1.5) as Quality,
  language,
  autoSwitch: localStorage.getItem('game-auto-switch') !== 'false',
});

const optionStorageKeys: Partial<Record<keyof MatchOptions, string>> = {
  volume: 'game-volume', effectsEnabled: 'game-effects-enabled',
  commentaryVolume: 'game-commentary-volume', commentaryEnabled: 'game-commentary',
  crowdVolume: 'game-crowd-volume', crowdEnabled: 'game-crowd-enabled',
  autoSwitch: 'game-auto-switch',
};

export function GamePage() {
  const { language, setLanguage, t } = useI18n();
  const canvas = useRef<GameCanvasHandle>(null);
  const [options, setOptions] = useState(() => loadOptions(language));
  const [paused, setPaused] = useState(false);
  const [pauseSettingsOpen, setPauseSettingsOpen] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [match, setMatch] = useState(initialMatch);
  const stableOptions = useMemo(() => ({ ...options, language }), [language, options]);
  const updateSnapshot = useCallback((snapshot: MatchSnapshot) => setMatch(snapshot), []);
  const opponent = (options.team + 1) % TEAMS.length;

  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (!['KeyP', 'Escape'].includes(event.code) || event.repeat) return;
      if (paused && pauseSettingsOpen) setPauseSettingsOpen(false);
      else {
        setPaused((value) => !value);
        setPauseSettingsOpen(false);
      }
    };
    addEventListener('keydown', toggle);
    return () => removeEventListener('keydown', toggle);
  }, [paused, pauseSettingsOpen]);

  const updateOption = <Key extends keyof MatchOptions>(key: Key, value: MatchOptions[Key]) => {
    setOptions((current) => ({ ...current, [key]: value }));
    const storageKey = optionStorageKeys[key];
    if (storageKey) localStorage.setItem(storageKey, String(value));
  };

  const restart = () => {
    setMatch(initialMatch());
    setPaused(false);
    setPauseSettingsOpen(false);
    setRestartKey((value) => value + 1);
  };
  return (
    <main className="game-page">
      <GameHud
        match={match}
        teamNames={[TEAMS[options.team].name, TEAMS[opponent].name]}
        teamSymbols={[TEAMS[options.team].symbol, TEAMS[opponent].symbol]}
        onPause={() => {
          setPaused((value) => !value);
          setPauseSettingsOpen(false);
        }}
      />
      <GameCanvas ref={canvas} options={stableOptions} paused={paused} restartKey={restartKey} onSnapshot={updateSnapshot} />
      <MobileControls
        onMove={(x, y) => canvas.current?.setMove(x, y)}
        onAim={(x, y) => canvas.current?.setAim(x, y)}
        onKick={() => canvas.current?.kick()}
        onSwitch={() => canvas.current?.switchPlayer()}
      />
      <div className="rotate-phone"><span>↻</span><b>{t('mobile.rotate')}</b><small>{t('mobile.rotateHint')}</small></div>
      {match.event && <MatchEventOverlay event={match.event} />}
      {paused && <PauseMenu onContinue={() => setPaused(false)} onOpenSettings={() => setPauseSettingsOpen(true)} onRestart={restart} />}
      {paused && pauseSettingsOpen && (
        <PauseSettings
          options={options}
          language={language}
          onOptionChange={updateOption}
          onLanguageChange={setLanguage}
          onClose={() => setPauseSettingsOpen(false)}
        />
      )}
      {match.state === 'ended' && <MatchResult match={match} onRestart={restart} />}
    </main>
  );
}
