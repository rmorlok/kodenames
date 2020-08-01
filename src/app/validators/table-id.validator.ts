import { Injectable } from '@angular/core';
import {
    AbstractControl,
    AsyncValidator,
    ValidationErrors
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TableService } from '@services/table.service';

@Injectable({providedIn: 'root'})
export class TableIdValidator implements AsyncValidator {
    constructor(
        private tableService: TableService
    ) {
    }

    validate(
        ctrl: AbstractControl
    ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        if (!ctrl.value || ctrl.value.toString().length < 6) {
            return of({tableIdInvalid: true});
        }

        return this.tableService.doesTableExist(ctrl.value.toString()).pipe(
            map(exists => (exists ? null : {tableIdInvalid: true})),
            catchError(() => of({tableIdInvalid: true}))
        );
    }
}
