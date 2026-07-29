import { Link } from 'wouter';

export function HomePage() {
  return (
    <main className="container">
      <section className="hello">
        <p className="eyebrow">2D FOOTBALL / 2026</p>
        <h1>Touchline 90</h1>
        <p>Быстрый футбольный матч с физикой мяча, командами и умным соперником.</p>
        <Link href="/game" className="home-play">Играть сейчас →</Link>
      </section>
    </main>
  );
}
