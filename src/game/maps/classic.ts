import type { MapConfig } from './types';

export const classicMap: MapConfig = {
  id: 'classic', nameKey: 'maps.classic', descriptionKey: 'maps.classicDescription', atmosphereKey: 'maps.classicAtmosphere',
  surface: 'grass', decoration: 'stands',
  field: { width: 1200, height: 700, margin: 55, goalWidth: 230, goalDepth: 48, postRadius: 7 },
  palette: { background: '#071b13', surface: '#237342', surfaceDark: '#0b3524', surfaceLight: '#53a068', line: '#f5faec', net: '#e9f5ed', accent: '#a8d930' },
};
