export const FIELD = { width: 1200, height: 700, margin: 55, goalWidth: 230 };
export const MATCH_SECONDS = 90;
export const STEP = 1 / 60;

export const TEAMS = [
  { id: 'imperial-madrid', name: 'VAR Madrid', short: 'VM', symbol: '♛', primary: '#f4f1e8', secondary: '#c7a648', away: '#191c24', descriptionKey: 'team.imperialMadrid' },
  { id: 'london-royals', name: 'London Royals', short: 'LR', symbol: '♜', primary: '#5b2a86', secondary: '#e1c05a', away: '#f5f1e7', descriptionKey: 'team.londonRoyals' },
  { id: 'milano-stars', name: 'Milano Stars', short: 'MS', symbol: '★', primary: '#15171c', secondary: '#d8b44a', away: '#f0eee7', descriptionKey: 'team.milanoStars' },
  { id: 'paris-empire', name: 'Paris Empire', short: 'PE', symbol: '◆', primary: '#152b66', secondary: '#d53b50', away: '#e9e5dc', descriptionKey: 'team.parisEmpire' },
  { id: 'barcelona-titans', name: 'Barcelona Titans', short: 'BT', symbol: 'T', primary: '#8e2038', secondary: '#294a9a', away: '#f1c94b', descriptionKey: 'team.barcelonaTitans' },
  { id: 'munich-eagles', name: 'Munich Eagles', short: 'ME', symbol: '▲', primary: '#b92732', secondary: '#f2eee7', away: '#232a36', descriptionKey: 'team.munichEagles' },
  { id: 'lisbon-phoenix', name: 'Lisbon Phoenix', short: 'LP', symbol: '✦', primary: '#12814e', secondary: '#d7b548', away: '#f3eee3', descriptionKey: 'team.lisbonPhoenix' },
  { id: 'amsterdam-legends', name: 'Amsterdam Legends', short: 'AL', symbol: 'A', primary: '#df3e32', secondary: '#f4f0e8', away: '#20252d', descriptionKey: 'team.amsterdamLegends' },
  { id: 'turin-dynasty', name: 'Turin Dynasty', short: 'TD', symbol: 'D', primary: '#17191d', secondary: '#ece9df', away: '#d4b555', descriptionKey: 'team.turinDynasty' },
  { id: 'rome-united', name: 'Rome United', short: 'RU', symbol: 'R', primary: '#7f202d', secondary: '#e3a737', away: '#eee9df', descriptionKey: 'team.romeUnited' },
] as const;

export type Difficulty = 'easy' | 'normal' | 'hard';
export type Quality = 1 | 1.5 | 2;
export const AI_LEVELS: Record<Difficulty, { speed: number; accuracy: number; reaction: number }> = {
  easy: { speed: 0.5, accuracy: 0.38, reaction: 0.8 },
  normal: { speed: 0.65, accuracy: 0.54, reaction: 1.35 },
  hard: { speed: 0.8, accuracy: 0.68, reaction: 2 },
};
