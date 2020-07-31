import { Team } from './team';

export type CardColor = Team | 'yellow' | 'black';

export interface Card {
    word: string;
    revealed: boolean;
    color: CardColor;
}
