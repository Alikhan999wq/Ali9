import { useRef, useState } from 'react';
import { useI18n } from '../i18n/I18n';

interface TouchStickProps {
  label: string;
  onChange: (x: number, y: number) => void;
  resetOnRelease?: boolean;
}

function TouchStick({ label, onChange, resetOnRelease = true }: TouchStickProps) {
  const stickRef = useRef<HTMLDivElement>(null);
  const [nub, setNub] = useState({ x: 0, y: 0 });

  const move = (clientX: number, clientY: number) => {
    const rect = stickRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rawX = clientX - rect.left - rect.width / 2;
    const rawY = clientY - rect.top - rect.height / 2;
    const radius = rect.width * .3;
    const length = Math.hypot(rawX, rawY) || 1;
    const scale = Math.min(radius, length) / length;
    const x = rawX * scale;
    const y = rawY * scale;
    setNub({ x, y });
    onChange(x / radius, y / radius);
  };

  const release = () => {
    setNub({ x: 0, y: 0 });
    if (resetOnRelease) onChange(0, 0);
  };

  return (
    <div className="touch-stick-wrap">
      <div
        ref={stickRef}
        className="mobile-stick"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event.clientX, event.clientY);
        }}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <i style={{ transform: `translate(${nub.x}px, ${nub.y}px)` }} />
      </div>
      <span>{label}</span>
    </div>
  );
}

interface MobileControlsProps {
  onMove: (x: number, y: number) => void;
  onAim: (x: number, y: number) => void;
  onKick: () => void;
}

export function MobileControls({ onMove, onAim, onKick }: MobileControlsProps) {
  const { t } = useI18n();
  return (
    <div className="mobile-controls">
      <TouchStick label={t('mobile.move')} onChange={onMove} />
      <div className="mobile-actions">
        <button type="button" className="mobile-kick" onPointerDown={(event) => { event.preventDefault(); onKick(); }}>{t('mobile.kick')}</button>
      </div>
      <TouchStick label={t('mobile.aim')} onChange={onAim} resetOnRelease={false} />
    </div>
  );
}
