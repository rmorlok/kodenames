import { Team } from './team';

export interface Clue {
    team: Team;
    value: string;
    count: 'unlimited' | number;
}
