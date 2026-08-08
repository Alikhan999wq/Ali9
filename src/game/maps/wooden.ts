import type { MapConfig } from './types';

export const woodenMap: MapConfig = {
  id: 'wooden', nameKey: 'maps.wooden', descriptionKey: 'maps.woodenDescription', atmosphereKey: 'maps.woodenAtmosphere',
  surface: 'wood', decoration: 'wooden',
  field: { width: 1040, height: 640, margin: 62, goalWidth: 170, goalDepth: 38, postRadius: 6 },
  palette: { background: '#24150d', surface: '#9a5d32', surfaceDark: '#57301d', surfaceLight: '#c7844d', line: '#fff8e9', net: '#f8ead5', accent: '#efb56c' },
};
