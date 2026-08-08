import type { TranslationKey } from '../../i18n/ru';

export type MapId = 'classic' | 'wooden' | 'night' | 'beach' | 'stadium';
export type SurfaceStyle = 'grass' | 'wood' | 'night' | 'sand' | 'pro';
export type DecorationStyle = 'stands' | 'wooden' | 'floodlights' | 'beach' | 'professional';

export interface FieldGeometry {
  width: number;
  height: number;
  margin: number;
  goalWidth: number;
  goalDepth: number;
  postRadius: number;
}

export interface MapPalette {
  background: string;
  surface: string;
  surfaceDark: string;
  surfaceLight: string;
  line: string;
  net: string;
  accent: string;
}

export interface MapConfig {
  id: MapId;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  atmosphereKey: TranslationKey;
  surface: SurfaceStyle;
  decoration: DecorationStyle;
  simplifiedMarkings?: boolean;
  field: FieldGeometry;
  palette: MapPalette;
}
