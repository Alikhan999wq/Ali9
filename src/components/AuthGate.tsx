import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { AuthScreen } from '../pages/AuthScreen';

export function AuthGate({ children }: { children: ReactNode }) {
  const { identity, loading } = useAuth();
  if (loading) return <main className="auth-loading"><span className="football-brand__ball">⚽</span></main>;
  if (!identity) return <AuthScreen />;
  return children;
}
