import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import { GameCanvas, type GameCanvasHandle } from '../components/GameCanvas';
import { GameHud } from '../components/GameHud';
import { MatchEventOverlay } from '../components/MatchEventOverlay';
import { MatchResult } from '../components/MatchResult';
import { MobileControls } from '../components/MobileControls';
import { MATCH_SECONDS, TEAMS, type Difficulty, type Quality } from '../game/config';
import type { MatchOptions, MatchSnapshot } from '../game/types';

const initialMatch = (): MatchSnapshot => ({
  state: 'playing', score: [0, 0], seconds: MATCH_SECONDS, event: null,
  stats: {
    shots: [0, 0], onTarget: [0, 0], possession: [0, 0], passes: [0, 0],
    passAttempts: [0, 0], fouls: [0, 0], cards: [0, 0], offsides: [0, 0],
  },
});

const loadOptions = (): MatchOptions => ({
  team: Math.max(0, Math.min(TEAMS.length - 1, Number(localStorage.getItem('game-team') || 0))),
  difficulty: (localStorage.getItem('game-difficulty') || 'normal') as Difficulty,
  volume: Number(localStorage.getItem('game-volume') || .65),
  effectsEnabled: localStorage.getItem('game-effects-enabled') !== 'false',
  commentaryVolume: Number(localStorage.getItem('game-commentary-volume') || .75),
  commentaryEnabled: localStorage.getItem('game-commentary') !== 'false',
  crowdVolume: Number(localStorage.getItem('game-crowd-volume') || .65),
  crowdEnabled: localStorage.getItem('game-crowd-enabled') !== 'false',
  quality: Number(localStorage.getItem('game-quality') || 1.5) as Quality,
});

export function GamePage() {
  const canvas = useRef<GameCanvasHandle>(null);
  const [options] = useState(loadOptions);
  const [paused, setPaused] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [match, setMatch] = useState(initialMatch);
  const stableOptions = useMemo(() => options, [options]);
  const updateSnapshot = useCallback((snapshot: MatchSnapshot) => setMatch(snapshot), []);
  const opponent = (options.team + 1) % TEAMS.length;

  useEffect(() => {
    const toggle = (event: KeyboardEvent) => {
      if (event.code === 'KeyP' && !event.repeat) setPaused((value) => !value);
    };
    addEventListener('keydown', toggle);
    return () => removeEventListener('keydown', toggle);
  }, []);

  const restart = () => {
    setMatch(initialMatch());
    setPaused(false);
    setRestartKey((value) => value + 1);
  };
  return (
    <main className="game-page">
      <GameHud
        match={match}
        teamNames={[TEAMS[options.team].name, TEAMS[opponent].name]}
        teamSymbols={[TEAMS[options.team].symbol, TEAMS[opponent].symbol]}
        onPause={() => setPaused((value) => !value)}
      />
      <GameCanvas ref={canvas} options={stableOptions} paused={paused} restartKey={restartKey} onSnapshot={updateSnapshot} />
      <MobileControls
        onMove={(x, y) => canvas.current?.setMove(x, y)}
        onAim={(x, y) => canvas.current?.setAim(x, y)}
        onKick={() => canvas.current?.kick()}
      />
      <div className="rotate-phone"><span>↻</span><b>Поверните телефон</b><small>Играть удобнее в альбомном режиме</small></div>
      {match.event && <MatchEventOverlay event={match.event} />}
      {paused && (
        <section className="match-modal">
          <p className="eyebrow">МАТЧ ОСТАНОВЛЕН</p>
          <h2>Пауза</h2>
          <div className="match-modal__actions">
            <button type="button" onClick={() => setPaused(false)}>Продолжить</button>
            <Link href="/" className="secondary-button">Назад в меню</Link>
          </div>
        </section>
      )}
      {match.state === 'ended' && <MatchResult match={match} onRestart={restart} />}
    </main>
  );
}
