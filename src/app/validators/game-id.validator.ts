import { Injectable } from '@angular/core';
import {
    AbstractControl,
    AsyncValidator,
    ValidationErrors
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GameService } from '@services/game.service';

@Injectable({providedIn: 'root'})
export class GameIdValidator implements AsyncValidator {
    constructor(
        private gameServe: GameService
    ) {
    }

    validate(
        ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        if (!ctrl.value || ctrl.value.toString().length < 6) {
            return of({gameIdInvalid: true});
        }

        return this.gameServe.doesGameExist(ctrl.value.toString()).pipe(
            map(exists => (exists ? null : {gameIdInvalid: true})),
            catchError(() => of({gameIdInvalid: true}))
        );
    }
}
