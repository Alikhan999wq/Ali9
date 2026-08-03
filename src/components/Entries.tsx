import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';
import { useI18n } from '../i18n/I18n';

// Пример работы с базой: читаем, добавляем и удаляем свои записи.
// Таблица `entries` создаётся миграцией в supabase/migrations/. Переделай это под свою идею:
// вопросы для квиза, привычки, места, карточки — что угодно.
type Entry = {
  id: string;
  title: string;
  created_at: string;
};

export function Entries({ userEmail }: { userEmail: string }) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from('entries')
      .select('id, title, created_at')
      .order('created_at', { ascending: false });
    if (error) setError(true);
    else setEntries(data ?? []);
  }

  useEffect(() => {
    if (isSupabaseConfigured) void load();
  }, []);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await supabase.from('entries').insert({ title: title.trim() });
    if (error) setError(true);
    else {
      setTitle('');
      load();
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) setError(true);
    else load();
  }

  return (
    <section className="card">
      <p className="hello">{t('entries.hello', { email: userEmail })}</p>
      <h2>{t('entries.title')}</h2>

      <form onSubmit={add} className="form-row">
        <input
          placeholder={t('entries.placeholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">{t('entries.add')}</button>
      </form>

      {error && <p className="message">{t('entries.error')}</p>}

      {entries.length === 0 ? (
        <p className="empty">{t('entries.empty')}</p>
      ) : (
        <ul className="list">
          {entries.map((it) => (
            <li key={it.id}>
              <span>{it.title}</span>
              <button className="ghost small" onClick={() => remove(it.id)}>
                {t('entries.delete')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
