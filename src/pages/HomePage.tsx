import { Link } from 'wouter';
import { useI18n } from '../i18n/I18n';

export function HomePage() {
  const { t } = useI18n();
  return (
    <main className="football-home">
      <section className="football-menu">
        <header className="football-brand">
          <span className="football-brand__ball">⚽</span>
          <div><strong>TOUCHLINE</strong><b>GAME</b><small>MASTER</small></div>
        </header>
        <nav className="football-nav" aria-label={t('home.mainMenu')}>
          <Link href="/game" className="football-nav__item football-nav__item--primary"><span>⚽</span>{t('home.quickGame')}</Link>
          <Link href="/teams" className="football-nav__item"><span>🏆</span>{t('home.teamSelection')}</Link>
          <Link href="/settings" className="football-nav__item"><span>⚙</span>{t('home.settings')}</Link>
          <Link href="/controls" className="football-nav__item"><span>⌨</span>{t('home.controls')}</Link>
        </nav>
        <footer className="football-menu__footer"><i /> {t('home.season')}</footer>
      </section>
    </main>
  );
}
