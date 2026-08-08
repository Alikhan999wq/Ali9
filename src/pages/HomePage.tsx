import { Link } from 'wouter';
import { useI18n } from '../i18n/I18n';
import { useAuth } from '../auth/AuthContext';

export function HomePage() {
  const { t } = useI18n();
  const { identity, logout } = useAuth();
  return (
    <main className="football-home">
      <section className="football-menu">
        <header className="football-brand">
          <span className="football-brand__ball">⚽</span>
          <div><strong>TOUCHLINE</strong><b>GAME</b><small>MASTER</small></div>
        </header>
        <div className="football-account">
          <span><small>{t('auth.player')}</small><b>{identity?.guest ? t('auth.guest') : identity?.nickname}</b></span>
          <button type="button" onClick={() => void logout()}>{t('auth.logout')}</button>
        </div>
        <nav className="football-nav" aria-label={t('home.mainMenu')}>
          <Link href="/maps" className="football-nav__item football-nav__item--primary"><span>⚽</span>{t('home.quickGame')}</Link>
          <Link href="/teams" className="football-nav__item"><span>🏆</span>{t('home.teamSelection')}</Link>
          <Link href="/maps" className="football-nav__item"><span>▰</span>{t('home.mapSelection')}</Link>
          <Link href="/settings" className="football-nav__item"><span>⚙</span>{t('home.settings')}</Link>
          <Link href="/controls" className="football-nav__item"><span>⌨</span>{t('home.controls')}</Link>
        </nav>
        <footer className="football-menu__footer"><i /> {t('home.season')}</footer>
      </section>
    </main>
  );
}
