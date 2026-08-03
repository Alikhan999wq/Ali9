import { Link } from 'wouter';
import { useI18n } from '../i18n/I18n';

interface PauseMenuProps {
  onContinue: () => void;
  onOpenSettings: () => void;
  onRestart: () => void;
}

export function PauseMenu({ onContinue, onOpenSettings, onRestart }: PauseMenuProps) {
  const { t } = useI18n();
  return (
    <div className="pause-overlay" role="presentation">
      <section className="pause-panel" role="dialog" aria-modal="true" aria-labelledby="pause-title">
        <button type="button" className="pause-panel__settings" onClick={onOpenSettings}>
          <span aria-hidden="true">⚙</span> {t('settings.title')}
        </button>
        <p className="eyebrow">{t('pause.eyebrow')}</p>
        <h2 id="pause-title">{t('pause.title')}</h2>
        <div className="pause-panel__actions">
          <button type="button" className="pause-panel__primary" onClick={onContinue}>{t('pause.continue')}</button>
          <button type="button" onClick={onRestart}>{t('pause.restart')}</button>
          <Link href="/">{t('pause.mainMenu')}</Link>
        </div>
        <small>{t('pause.hint')}</small>
      </section>
    </div>
  );
}
