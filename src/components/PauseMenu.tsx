import { Link } from 'wouter';

interface PauseMenuProps {
  onContinue: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
}

export function PauseMenu({ onContinue, onOpenSettings, onRestart }: PauseMenuProps) {
  return (
    <div className="pause-overlay" role="presentation">
      <section className="pause-panel" role="dialog" aria-modal="true" aria-labelledby="pause-title">
        <button type="button" className="pause-panel__settings" onClick={onOpenSettings}>
          <span aria-hidden="true">⚙</span> Настройки
        </button>
        <p className="eyebrow">МАТЧ ОСТАНОВЛЕН</p>
        <h2 id="pause-title">Пауза</h2>
        <div className="pause-panel__actions">
          <button type="button" className="pause-panel__primary" onClick={onContinue}>Продолжить игру</button>
          <button type="button" onClick={onRestart}>Начать матч заново</button>
          <Link href="/">Вернуться в главное меню</Link>
        </div>
        <small>Клавиша P — продолжить матч</small>
      </section>
    </div>
  );
}
