import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';
import { useI18n, type TranslationKey } from '../i18n/I18n';

// Вход и регистрация по email + паролю. Это пример — Codex поможет улучшить (Google-вход и т.д.).
export function Auth() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState<TranslationKey | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const fn =
        mode === 'signup'
          ? supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin },
            })
          : supabase.auth.signInWithPassword({ email, password });
      const { error } = await fn;
      if (error) setMessage('auth.error');
      else if (mode === 'signup') setMessage('auth.success');
    } catch {
      setMessage('auth.error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>{t(mode === 'signin' ? 'auth.signIn' : 'auth.signUp')}</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        <button type="submit" disabled={busy}>
          {busy ? '…' : t(mode === 'signin' ? 'auth.submitSignIn' : 'auth.submitSignUp')}
        </button>
      </form>
      {message && <p className="message">{t(message)}</p>}
      <button
        className="ghost"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {t(mode === 'signin' ? 'auth.switchToSignUp' : 'auth.switchToSignIn')}
      </button>
    </section>
  );
}
