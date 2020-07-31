import { Person } from '@models/person';

export interface DeviceState {
    person?: Person;
    gameId?: string;
}
