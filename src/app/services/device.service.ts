import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import {
    DeviceState,
    Person
} from '@models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DeviceService {
    private currentState = JSON.parse(localStorage.getItem('state') || '{}') as DeviceState;
    private stateSubject = new BehaviorSubject<DeviceState>(this.currentState);

    constructor() {}

    state$(): Observable<DeviceState> {
        return this.stateSubject.asObservable();
    }

    setGameId(gameId: string | null): void {
        const s = this.cloneState();

        if (gameId) {
            s.gameId = gameId;
        } else {
            delete s['gameId'];
        }

        this.saveState(s);
    }

    clearGameId(): void {
        this.setGameId(null);
    }

    setPerson(p: Person | null): void {
        const s = this.cloneState();

        if (p) {
            s.person = p;
        } else {
            delete s['person'];
        }

        this.saveState(s);
    }

    setNewPerson(name: string): void {
        this.setPerson({
            uuid: uuidv4(),
            name: name
        });
    }

    clearPerson(): void {
        this.setPerson(null);
    }

    private cloneState(): DeviceState {
        return Object.assign<DeviceState, DeviceState>({}, this.currentState);
    }

    private saveState(s: DeviceState): void {
        this.currentState = s;
        localStorage.setItem('state', JSON.stringify(s));
        this.stateSubject.next(s);
    }
}
