import type { MapConfig } from './types';

export const beachMap: MapConfig = {
  id: 'beach', nameKey: 'maps.beach', descriptionKey: 'maps.beachDescription', atmosphereKey: 'maps.beachAtmosphere',
  surface: 'sand', decoration: 'beach', simplifiedMarkings: true,
  field: { width: 1080, height: 650, margin: 60, goalWidth: 180, goalDepth: 40, postRadius: 6 },
  palette: { background: '#397f9a', surface: '#d8b873', surfaceDark: '#a77e43', surfaceLight: '#f0d696', line: '#fff9dd', net: '#fff4cc', accent: '#42d3df' },
};
