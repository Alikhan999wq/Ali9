import type { MapConfig } from './types';

export const nightMap: MapConfig = {
  id: 'night', nameKey: 'maps.night', descriptionKey: 'maps.nightDescription', atmosphereKey: 'maps.nightAtmosphere',
  surface: 'night', decoration: 'floodlights',
  field: { width: 1160, height: 680, margin: 56, goalWidth: 210, goalDepth: 46, postRadius: 7 },
  palette: { background: '#020611', surface: '#102d35', surfaceDark: '#06151f', surfaceLight: '#20505b', line: '#bffcff', net: '#bcecff', accent: '#4ce6ff' },
};
