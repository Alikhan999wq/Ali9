import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../auth/AuthContext';
import { NicknameAuthError, type AuthFailure } from '../lib/nicknameAuth';
import { useI18n, type TranslationKey } from '../i18n/I18n';

type Mode = 'login' | 'register';

const errorKeys: Record<AuthFailure, TranslationKey> = {
  nickname_taken: 'auth.nicknameTaken',
  wrong_password: 'auth.wrongPassword',
  invalid_nickname: 'auth.invalidNickname',
  invalid_password: 'auth.invalidPassword',
  server_error: 'auth.serverError',
};

export function AuthScreen() {
  const { t } = useI18n();
  const { login, register, continueAsGuest } = useAuth();
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<Mode>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<TranslationKey | null>(null);
  const [busy, setBusy] = useState(false);

  const chooseMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'register') await register(nickname, password);
      else await login(nickname, password);
      navigate('/');
    } catch (caught) {
      const reason = caught instanceof NicknameAuthError ? caught.reason : 'server_error';
      setError(errorKeys[reason]);
    } finally {
      setBusy(false);
    }
  };

  const enterAsGuest = () => {
    continueAsGuest();
    navigate('/');
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <header className="auth-brand">
          <span className="football-brand__ball">⚽</span>
          <div><strong>TOUCHLINE</strong><b>GAME MASTER</b></div>
        </header>
        <p className="eyebrow">{t('auth.playerAccount')}</p>
        <h1 id="auth-title">{t(mode === 'login' ? 'auth.signIn' : 'auth.signUp')}</h1>
        <div className="auth-tabs" role="tablist">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => chooseMode('login')}>{t('auth.submitSignIn')}</button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => chooseMode('register')}>{t('auth.register')}</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <label>{t('auth.nickname')}
            <input value={nickname} onChange={(event) => setNickname(event.target.value)} minLength={3} maxLength={20} autoComplete="username" required />
          </label>
          <label>{t('auth.passwordLabel')}
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} maxLength={72} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
          </label>
          {error && <p className="auth-error" role="alert">{t(error)}</p>}
          <button type="submit" className="auth-submit" disabled={busy}>{busy ? '…' : t(mode === 'login' ? 'auth.submitSignIn' : 'auth.register')}</button>
        </form>
        <button type="button" className="auth-guest" onClick={enterAsGuest}>{t('auth.continueGuest')}</button>
      </section>
    </main>
  );
}
