import type { ReactNode } from 'react';
import { Link } from 'wouter';

interface MenuScreenProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  wide?: boolean;
  showBack?: boolean;
}

export function MenuScreen({ eyebrow, title, children, wide = false, showBack = true }: MenuScreenProps) {
  return (
    <main className="menu-screen">
      <section className={wide ? 'menu-window menu-window--wide' : 'menu-window'}>
        {showBack && <Link href="/" className="menu-window__back">← НАЗАД</Link>}
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}
