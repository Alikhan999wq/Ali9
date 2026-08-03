import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { en } from './en';
import { ru, type TranslationKey } from './ru';

export type Language = 'ru' | 'en';
export type TranslationParams = Record<string, string | number>;

interface I18nValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

const readLanguage = (): Language => localStorage.getItem('game-language') === 'en' ? 'en' : 'ru';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readLanguage);

  useEffect(() => {
    localStorage.setItem('game-language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nValue>(() => ({
    language,
    setLanguage: (nextLanguage) => setLanguageState(nextLanguage),
    t: (key, params) => {
      const template = (language === 'en' ? en : ru)[key];
      if (!params) return template;
      return Object.entries(params).reduce(
        (result, [name, replacement]) => result.split(`{${name}}`).join(String(replacement)),
        template,
      );
    },
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}

export type { TranslationKey } from './ru';
