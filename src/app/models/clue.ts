import { Team } from './team';
import { Card } from './card';

export interface Clue {
    team: Team;
    value: string;
    count: 'unlimited' | number;
    chosenCards: Card[];
    done: boolean;
}
