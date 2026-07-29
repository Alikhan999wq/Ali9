export const FIELD = { width: 1200, height: 700, margin: 55, goalWidth: 230 };
export const MATCH_SECONDS = 90;
export const STEP = 1 / 60;

export const TEAMS = [
  { name: 'Север', short: 'FC', primary: '#246bff', secondary: '#dce9ff' },
  { name: 'Искра', short: 'IK', primary: '#f04e3e', secondary: '#ffd23d' },
  { name: 'Тайга', short: 'TG', primary: '#159a68', secondary: '#effff7' },
] as const;

export type Difficulty = 'easy' | 'normal' | 'hard';
export type Quality = 1 | 1.5 | 2;
export const AI_LEVELS: Record<Difficulty, { speed: number; accuracy: number }> = {
  easy: { speed: 0.72, accuracy: 0.58 },
  normal: { speed: 0.88, accuracy: 0.76 },
  hard: { speed: 1.05, accuracy: 0.9 },
};
