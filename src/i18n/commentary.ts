import type { CommentaryEvent } from '../game/Commentary';

export const englishCommentary: Record<CommentaryEvent, string[]> = {
  start: ['The match is underway!', 'The referee starts the match!'],
  goal: ['Goal!'],
  'goal-extra': [
    'What a brilliant finish!',
    'An outstanding goal!',
    'The crowd is on its feet!',
    'That strike was unstoppable!',
    'A fantastic move and a perfect finish!',
  ],
  danger: ['A dangerous effort on goal!', 'That was very close!'],
  shot: ['He takes the shot!', 'A powerful strike!'],
  save: ['A wonderful save by the goalkeeper!', 'The keeper keeps it out!'],
  post: ['Off the post!', 'The woodwork denies the goal!'],
  foul: ['The referee calls a foul.', 'A late challenge stops the attack.'],
  yellow: ['The referee shows a yellow card.', 'That challenge earns a booking.'],
  red: ['It is a red card!', 'The player has been sent off!'],
  end: ['The final whistle. The match is over.', 'Full time at the stadium.'],
};
