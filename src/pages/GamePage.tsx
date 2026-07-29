import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameCanvas, type GameCanvasHandle } from '../components/GameCanvas';
import { GameHud } from '../components/GameHud';
import { GameSetup } from '../components/GameSetup';
import { MatchEventOverlay } from '../components/MatchEventOverlay';
import { MatchResult } from '../components/MatchResult';
import { MobileControls } from '../components/MobileControls';
import { MATCH_SECONDS, TEAMS, type Difficulty, type Quality } from '../game/config';
import type { MatchOptions, MatchSnapshot } from '../game/types';

const initialMatch = (): MatchSnapshot => ({
  state: 'playing', score: [0, 0], seconds: MATCH_SECONDS, event: null,
  stats: {
    shots: [0, 0], onTarget: [0, 0], possession: [0, 0], passes: [0, 0],
    passAttempts: [0, 0], fouls: [0, 0], cards: [0, 0], offsides: [0, 0], corners: [0, 0],
  },
});

const loadOptions = (): MatchOptions => ({
  team: Number(localStorage.getItem('game-team') || 0),
  difficulty: (localStorage.getItem('game-difficulty') || 'normal') as Difficulty,
  volume: Number(localStorage.getItem('game-volume') || .65),
  quality: Number(localStorage.getItem('game-quality') || 1.5) as Quality,
});

export function GamePage() {
  const canvas = useRef<GameCanvasHandle>(null);
  const [options, setOptions] = useState(loadOptions);
  const [language, setLanguage] = useState<'ru' | 'en'>((localStorage.getItem('game-language') || 'ru') as 'ru' | 'en');
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [match, setMatch] = useState(initialMatch);
  const stableOptions = useMemo(() => options, [options]);
  const updateSnapshot = useCallback((snapshot: MatchSnapshot) => setMatch(snapshot), []);
  const opponent = options.team === 1 ? 0 : 1;

  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (event.code === 'KeyP' && !event.repeat && started) setPaused((value) => !value);
    };
    addEventListener('keydown', toggle);
    return () => removeEventListener('keydown', toggle);
  }, [started]);

  const restart = () => {
    setMatch(initialMatch());
    setPaused(false);
    setRestartKey((value) => value + 1);
  };
  const changeLanguage = (value: 'ru' | 'en') => {
    localStorage.setItem('game-language', value);
    setLanguage(value);
  };

  if (!started) return (
    <GameSetup options={options} language={language} onOptions={setOptions} onLanguage={changeLanguage} onStart={() => setStarted(true)} />
  );

  return (
    <main className="game-page">
      <GameHud match={match} teamNames={[TEAMS[options.team].name, TEAMS[opponent].name]} onPause={() => setPaused((value) => !value)} />
      <GameCanvas ref={canvas} options={stableOptions} paused={paused} restartKey={restartKey} onSnapshot={updateSnapshot} />
      <MobileControls onMove={(x, y) => canvas.current?.setMove(x, y)} onKick={(strong) => canvas.current?.kick(strong)} />
      {match.event && <MatchEventOverlay event={match.event} />}
      {paused && <section className="match-modal"><p className="eyebrow">МАТЧ ОСТАНОВЛЕН</p><h2>Пауза</h2><button onClick={() => setPaused(false)}>Продолжить</button></section>}
      {match.state === 'ended' && <MatchResult match={match} onRestart={restart} />}
    </main>
  );
}
