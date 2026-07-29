import type { MatchEvent } from '../game/types';

export function MatchEventOverlay({ event }: { event: MatchEvent }) {
  return (
    <section className={`match-event match-event--${event.kind}`}>
      <p className="eyebrow">{event.kind === 'var' ? 'VAR · ПРОВЕРКА ЭПИЗОДА' : 'СОБЫТИЕ МАТЧА'}</p>
      {event.kind === 'var' && <div className="var-replay"><span>● REC</span><i /></div>}
      <h2>{event.title}</h2>
      <p>{event.detail}</p>
      {event.rule && <small>{event.rule}<br />Решение судьи подтверждено системой анализа.</small>}
    </section>
  );
}
