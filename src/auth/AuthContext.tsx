import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { closeAccountSession, loginAccount, registerAccount, resumeAccount } from '../lib/nicknameAuth';

const TOKEN_KEY = 'game-account-token';
const GUEST_KEY = 'game-guest-session';

export interface PlayerIdentity {
  nickname: string;
  guest: boolean;
}

interface AuthValue {
  identity: PlayerIdentity | null;
  loading: boolean;
  login: (nickname: string, password: string) => Promise<void>;
  register: (nickname: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<PlayerIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      if (localStorage.getItem(GUEST_KEY) === 'true') setIdentity({ nickname: '', guest: true });
      setLoading(false);
      return;
    }
    void resumeAccount(token).then((session) => {
      if (session) setIdentity({ nickname: session.nickname, guest: false });
      else localStorage.removeItem(TOKEN_KEY);
      setLoading(false);
    });
  }, []);

  const saveAccount = (nickname: string, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(GUEST_KEY);
    setIdentity({ nickname, guest: false });
  };

  const value = useMemo<AuthValue>(() => ({
    identity,
    loading,
    login: async (nickname, password) => {
      const session = await loginAccount(nickname, password);
      saveAccount(session.nickname, session.token);
    },
    register: async (nickname, password) => {
      const session = await registerAccount(nickname, password);
      saveAccount(session.nickname, session.token);
    },
    continueAsGuest: () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.setItem(GUEST_KEY, 'true');
      setIdentity({ nickname: '', guest: true });
    },
    logout: async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(GUEST_KEY);
      setIdentity(null);
      if (token) await closeAccountSession(token);
    },
  }), [identity, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
