import type { MatchEvent } from '../game/types';
import { useI18n } from '../i18n/I18n';

export function MatchEventOverlay({ event }: { event: MatchEvent }) {
  const { t } = useI18n();
  return (
    <section className={`match-event match-event--${event.kind}`}>
      <p className="eyebrow">{t(event.kind === 'var' ? 'event.varReview' : 'event.matchEvent')}</p>
      {event.kind === 'var' && <div className="var-replay"><span>● REC</span><i /></div>}
      <h2>{t(event.titleKey)}</h2>
      <p>{t(event.detailKey, event.values)}</p>
      {event.ruleKey && <small>{t(event.ruleKey)}<br />{t('event.analysisConfirmed')}</small>}
    </section>
  );
}
