export type Team = 'red' | 'blue';

export interface CardState {
  word: string;
  revealed: boolean;
  color: Team | 'yellow' | 'black';
}

export interface Player {
  name: string;
  team: Team;
  spymaster: boolean;
}

export interface Clue {
  team: Team;
  value: string;
  count: 'unlimited' | number;
}

export interface GameState {
  players: Player[];
  clues: Clue[];
  cards: CardState[][];
}
