import type { Difficulty, Quality } from './config';

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
  title: string;
  detail: string;
  rule?: string;
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
  difficulty: Difficulty;
  volume: number;
  effectsEnabled: boolean;
  commentaryVolume: number;
  commentaryEnabled: boolean;
  crowdVolume: number;
  crowdEnabled: boolean;
  quality: Quality;
}
