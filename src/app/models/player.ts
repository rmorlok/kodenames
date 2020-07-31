import { Person } from './person';
import { Team } from './team';

export interface Player {
    person: Person;
    team: Team;
    spymaster: boolean;
}
