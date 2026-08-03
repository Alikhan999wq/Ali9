import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { useI18n } from '../i18n/I18n';

interface MenuScreenProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  wide?: boolean;
  showBack?: boolean;
}

export function MenuScreen({ eyebrow, title, children, wide = false, showBack = true }: MenuScreenProps) {
  const { t } = useI18n();
  return (
    <main className="menu-screen">
      <section className={wide ? 'menu-window menu-window--wide' : 'menu-window'}>
        {showBack && <Link href="/" className="menu-window__back">← {t('common.back')}</Link>}
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}
