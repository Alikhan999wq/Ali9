import { Link } from 'wouter';

export function HomePage() {
  return (
    <main className="football-home">
      <section className="football-menu">
        <header className="football-brand">
          <span className="football-brand__ball">⚽</span>
          <div><strong>TOUCHLINE</strong><b>GAME</b><small>MASTER</small></div>
        </header>
        <nav className="football-nav" aria-label="Главное меню">
          <Link href="/game" className="football-nav__item football-nav__item--primary"><span>⚽</span>БЫСТРАЯ ИГРА</Link>
          <Link href="/teams" className="football-nav__item"><span>🏆</span>ВЫБОР КОМАНДЫ</Link>
          <Link href="/settings" className="football-nav__item"><span>⚙</span>НАСТРОЙКИ</Link>
          <Link href="/controls" className="football-nav__item"><span>⌨</span>УПРАВЛЕНИЕ</Link>
        </nav>
        <footer className="football-menu__footer"><i /> СЕЗОН 2026 · 90 СЕКУНД</footer>
      </section>
    </main>
  );
}
