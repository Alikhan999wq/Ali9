import type { Difficulty, Quality } from './config';
import type { Language, TranslationParams } from '../i18n/I18n';
import type { TranslationKey } from '../i18n/ru';
import type { MapId } from './maps';

export type MatchState = 'playing' | 'paused' | 'ended';
export type Score = [number, number];
export type TeamStat = [number, number];

export interface Stats {
  shots: TeamStat;
  onTarget: TeamStat;
  possession: TeamStat;
  passes: TeamStat;
  passAttempts: TeamStat;
  fouls: TeamStat;
  cards: TeamStat;
  offsides: TeamStat;
}

export interface MatchEvent {
  id: number;
  kind: 'goal' | 'foul' | 'var';
  titleKey: TranslationKey;
  detailKey: TranslationKey;
  values?: TranslationParams;
  ruleKey?: TranslationKey;
}

export interface MatchSnapshot {
  state: MatchState;
  score: Score;
  seconds: number;
  stats: Stats;
  event: MatchEvent | null;
}

export interface MatchOptions {
  team: number;
  mapId: MapId;
  difficulty: Difficulty;
  volume: number;
  effectsEnabled: boolean;
  commentaryVolume: number;
  commentaryEnabled: boolean;
  crowdVolume: number;
  crowdEnabled: boolean;
  quality: Quality;
  language: Language;
}
