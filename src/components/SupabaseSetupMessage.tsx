import { useI18n } from '../i18n/I18n';

export function SupabaseSetupMessage() {
  const { t } = useI18n();
  return (
    <section className="card">
      <h2>{t('setup.title')}</h2>
      <p className="message">{t('setup.instructions')}</p>
    </section>
  );
}
