import { Person } from './person';

export interface ClientState {
    person?: Person | null;
    gameId?: string | null;
}
