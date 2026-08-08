import { isSupabaseConfigured, supabase } from './supabase';

export interface AccountSession {
  nickname: string;
  token: string;
}

export type AuthFailure = 'nickname_taken' | 'wrong_password' | 'invalid_nickname' | 'invalid_password' | 'server_error';

export class NicknameAuthError extends Error {
  constructor(public readonly reason: AuthFailure) {
    super(reason);
  }
}

function readSession(data: unknown): AccountSession {
  const row = Array.isArray(data) ? data[0] : null;
  if (!row || typeof row !== 'object') throw new NicknameAuthError('server_error');
  const record = row as Record<string, unknown>;
  if (typeof record.nickname !== 'string' || typeof record.token !== 'string') {
    throw new NicknameAuthError('server_error');
  }
  return { nickname: record.nickname, token: record.token };
}

function mapError(message: string): NicknameAuthError {
  const reasons: AuthFailure[] = ['nickname_taken', 'wrong_password', 'invalid_nickname', 'invalid_password'];
  return new NicknameAuthError(reasons.find((reason) => message.includes(reason)) ?? 'server_error');
}

async function callAuth(functionName: 'game_register' | 'game_login', nickname: string, password: string) {
  if (!isSupabaseConfigured) throw new NicknameAuthError('server_error');
  const { data, error } = await supabase.rpc(functionName, { p_nickname: nickname, p_password: password });
  if (error) throw mapError(error.message);
  return readSession(data);
}

export const registerAccount = (nickname: string, password: string) =>
  callAuth('game_register', nickname, password);

export const loginAccount = (nickname: string, password: string) =>
  callAuth('game_login', nickname, password);

export async function resumeAccount(token: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.rpc('game_resume_session', { p_token: token });
  if (error || !Array.isArray(data) || !data[0] || typeof data[0].nickname !== 'string') return null;
  return { nickname: data[0].nickname, token } satisfies AccountSession;
}

export async function closeAccountSession(token: string) {
  if (!isSupabaseConfigured) return;
  await supabase.rpc('game_logout', { p_token: token });
}
