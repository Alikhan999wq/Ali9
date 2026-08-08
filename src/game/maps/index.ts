import { beachMap } from './beach';
import { classicMap } from './classic';
import { nightMap } from './night';
import { stadiumMap } from './stadium';
import type { MapConfig, MapId } from './types';
import { woodenMap } from './wooden';

export const MAPS: readonly MapConfig[] = [classicMap, woodenMap, nightMap, beachMap, stadiumMap];
export const DEFAULT_MAP_ID: MapId = 'classic';

export function isMapId(value: string | null): value is MapId {
  return MAPS.some((map) => map.id === value);
}

export function getMapConfig(id: string | null | undefined): MapConfig {
  return MAPS.find((map) => map.id === id) ?? classicMap;
}

export type { FieldGeometry, MapConfig, MapId } from './types';
