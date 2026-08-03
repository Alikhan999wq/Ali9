import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { FIELD, STEP } from '../game/config';
import type { MatchOptions, MatchSnapshot } from '../game/types';

interface GameCanvasProps {
  options: MatchOptions;
  paused: boolean;
  restartKey: number;
  onSnapshot: (snapshot: MatchSnapshot) => void;
}

export interface GameCanvasHandle {
  setMove: (x: number, y: number) => void;
  setAim: (x: number, y: number) => void;
  kick: () => void;
}

export const GameCanvas = forwardRef<GameCanvasHandle, GameCanvasProps>(function GameCanvas(
  { options, paused, restartKey, onSnapshot },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const engine = new GameEngine(context, optionsRef.current);
    engineRef.current = engine;
    let frame = 0;
    let previous = performance.now();
    let accumulator = 0;
    let reportTimer = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio, optionsRef.current.quality);
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
    };
    const keyDown = (event: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
      engine.key(event.code, true);
    };
    const keyUp = (event: KeyboardEvent) => engine.key(event.code, false);
    const pointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = (event.clientX - rect.left) * canvas.width / rect.width;
      const canvasY = (event.clientY - rect.top) * canvas.height / rect.height;
      const scale = Math.min(canvas.width / FIELD.width, canvas.height / FIELD.height);
      const offsetX = (canvas.width - FIELD.width * scale) / 2;
      const offsetY = (canvas.height - FIELD.height * scale) / 2;
      engine.setAimPoint((canvasX - offsetX) / scale, (canvasY - offsetY) / scale);
    };
    const loop = (now: number) => {
      accumulator += Math.min(0.05, (now - previous) / 1000);
      previous = now;
      while (accumulator >= STEP) { engine.update(STEP); accumulator -= STEP; reportTimer += STEP; }
      engine.draw();
      if (reportTimer > 0.1) { onSnapshot(engine.snapshot()); reportTimer = 0; }
      frame = requestAnimationFrame(loop);
    };
    resize();
    addEventListener('resize', resize);
    addEventListener('keydown', keyDown);
    addEventListener('keyup', keyUp);
    canvas.addEventListener('pointermove', pointerMove);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      engine.destroy();
      removeEventListener('resize', resize);
      removeEventListener('keydown', keyDown);
      removeEventListener('keyup', keyUp);
      canvas.removeEventListener('pointermove', pointerMove);
    };
  }, [onSnapshot, restartKey]);

  useEffect(() => {
    engineRef.current?.configureAudio(options);
  }, [options]);

  useImperativeHandle(ref, () => ({
    setMove: (x, y) => engineRef.current?.setMove(x, y),
    setAim: (x, y) => engineRef.current?.setAimDirection(x, y),
    kick: () => engineRef.current?.queueKick(),
  }), []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const isPaused = engine.snapshot().state === 'paused';
    if (paused !== isPaused) engine.pause();
  }, [paused]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="Футбольное поле" />;
});
