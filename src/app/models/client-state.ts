import { Person } from './person';

export interface ClientState {
    person?: Person | null;
    tableId?: string | null;
}
