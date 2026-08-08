import type { MapConfig } from './types';

export const stadiumMap: MapConfig = {
  id: 'stadium', nameKey: 'maps.stadium', descriptionKey: 'maps.stadiumDescription', atmosphereKey: 'maps.stadiumAtmosphere',
  surface: 'pro', decoration: 'professional',
  field: { width: 1320, height: 760, margin: 58, goalWidth: 240, goalDepth: 52, postRadius: 7 },
  palette: { background: '#07110d', surface: '#1d6b3c', surfaceDark: '#0b3b25', surfaceLight: '#3f965a', line: '#ffffff', net: '#f1f5f2', accent: '#e3c35a' },
};
