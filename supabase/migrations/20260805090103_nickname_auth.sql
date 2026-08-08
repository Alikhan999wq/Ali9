create extension if not exists pgcrypto with schema extensions;

create table public.game_accounts (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  nickname_key text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  constraint nickname_length check (char_length(nickname) between 3 and 20)
);

create table public.game_sessions (
  token_hash text primary key,
  account_id uuid not null references public.game_accounts(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '180 days'),
  created_at timestamptz not null default now()
);

alter table public.game_accounts enable row level security;
alter table public.game_sessions enable row level security;
revoke all on public.game_accounts from anon, authenticated;
revoke all on public.game_sessions from anon, authenticated;

create or replace function public.game_register(p_nickname text, p_password text)
returns table(token text, nickname text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_nickname text := trim(p_nickname);
  v_account_id uuid;
  v_token text;
begin
  if char_length(v_nickname) < 3 or char_length(v_nickname) > 20 then
    raise exception 'invalid_nickname';
  end if;
  if char_length(p_password) < 6 or char_length(p_password) > 72 then
    raise exception 'invalid_password';
  end if;

  insert into public.game_accounts (nickname, nickname_key, password_hash)
  values (v_nickname, lower(v_nickname), extensions.crypt(p_password, extensions.gen_salt('bf', 10)))
  returning id into v_account_id;

  v_token := gen_random_uuid()::text || gen_random_uuid()::text;
  insert into public.game_sessions (token_hash, account_id)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), v_account_id);
  return query select v_token, v_nickname;
exception
  when unique_violation then raise exception 'nickname_taken';
end;
$$;

create or replace function public.game_login(p_nickname text, p_password text)
returns table(token text, nickname text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account public.game_accounts%rowtype;
  v_token text;
begin
  select * into v_account
  from public.game_accounts
  where nickname_key = lower(trim(p_nickname));

  if v_account.id is null or v_account.password_hash <> extensions.crypt(p_password, v_account.password_hash) then
    raise exception 'wrong_password';
  end if;

  v_token := gen_random_uuid()::text || gen_random_uuid()::text;
  insert into public.game_sessions (token_hash, account_id)
  values (encode(extensions.digest(v_token, 'sha256'), 'hex'), v_account.id);
  return query select v_token, v_account.nickname;
end;
$$;

create or replace function public.game_resume_session(p_token text)
returns table(account_id uuid, nickname text)
language sql
security definer
set search_path = ''
as $$
  select accounts.id, accounts.nickname
  from public.game_sessions sessions
  join public.game_accounts accounts on accounts.id = sessions.account_id
  where sessions.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
    and sessions.expires_at > now()
  limit 1;
$$;

create or replace function public.game_logout(p_token text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.game_sessions
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

revoke all on function public.game_register(text, text) from public;
revoke all on function public.game_login(text, text) from public;
revoke all on function public.game_resume_session(text) from public;
revoke all on function public.game_logout(text) from public;
grant execute on function public.game_register(text, text) to anon, authenticated;
grant execute on function public.game_login(text, text) to anon, authenticated;
grant execute on function public.game_resume_session(text) to anon, authenticated;
grant execute on function public.game_logout(text) to anon, authenticated;
