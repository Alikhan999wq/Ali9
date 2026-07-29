import { useRef } from 'react';

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onKick: (strong?: boolean) => void;
}

export function MobileControls({ onMove, onKick }: MobileControlsProps) {
  const stickRef = useRef<HTMLDivElement>(null);

  const move = (clientX: number, clientY: number) => {
    const rect = stickRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    const length = Math.max(38, Math.hypot(x, y));
    onMove(x / length, y / length);
  };

  return (
    <div className="mobile-controls">
      <div
        ref={stickRef}
        className="mobile-stick"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && move(event.clientX, event.clientY)}
        onPointerUp={() => onMove(0, 0)}
        onPointerCancel={() => onMove(0, 0)}
      ><i /></div>
      <button type="button" className="mobile-kick" onPointerDown={() => onKick(false)}>УДАР</button>
      <button type="button" className="mobile-strong" onPointerDown={() => onKick(true)}>СИЛЬНЫЙ</button>
    </div>
  );
}
