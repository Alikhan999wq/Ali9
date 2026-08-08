import { useState, type CSSProperties } from 'react';
import { Link } from 'wouter';
import { MenuScreen } from '../components/MenuScreen';
import { DEFAULT_MAP_ID, MAPS, isMapId, type MapId } from '../game/maps';
import { useI18n } from '../i18n/I18n';

export function MapsPage() {
  const { t } = useI18n();
  const saved = localStorage.getItem('game-map');
  const [selected, setSelected] = useState<MapId>(isMapId(saved) ? saved : DEFAULT_MAP_ID);

  const select = (mapId: MapId) => {
    setSelected(mapId);
    localStorage.setItem('game-map', mapId);
  };

  return (
    <MenuScreen eyebrow={t('maps.eyebrow')} title={t('maps.title')} wide showBack={false}>
      <div className="maps-grid">
        {MAPS.map((map) => (
          <article key={map.id} className={selected === map.id ? 'map-card map-card--active' : 'map-card'}>
            <div className={`map-preview map-preview--${map.surface}`} style={{
              '--map-bg': map.palette.background, '--map-surface': map.palette.surface,
              '--map-dark': map.palette.surfaceDark, '--map-light': map.palette.surfaceLight,
              '--map-line': map.palette.line,
            } as CSSProperties}>
              <i /><span /><b />
            </div>
            <div className="map-card__body">
              <h2>{t(map.nameKey)}</h2>
              <p>{t(map.descriptionKey)}</p>
              <small>{t(map.atmosphereKey)} · {map.field.width} × {map.field.height}</small>
              <button type="button" aria-pressed={selected === map.id} onClick={() => select(map.id)}>
                {selected === map.id ? t('maps.selected') : t('maps.select')}
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="teams-actions">
        <Link href="/" className="teams-back">← {t('common.back')}</Link>
        <Link href="/game" className="teams-start">{t('maps.start')} →</Link>
      </div>
    </MenuScreen>
  );
}
