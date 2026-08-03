import { Link } from 'wouter';
import { useI18n } from '../i18n/I18n';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <main className="container">
      <section className="hello">
        <h1>{t('notFound.title')}</h1>
        <p>
          <Link href="/">{t('notFound.home')}</Link>
        </p>
      </section>
    </main>
  );
}
