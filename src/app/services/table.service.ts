import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
    Table,
    TableState
} from '@models';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TableService {
    private readonly injector = inject(EnvironmentInjector);

    constructor(
        private firestore: AngularFirestore
    ) {
    }

    doesTableExist(tableId: string): Observable<boolean> {
        return new Observable<boolean>(observer => {
            const subscription = this.documentForId(tableId).get({source: 'server'}).subscribe(result => {
                    if (result.exists) {
                        observer.next(true);
                    } else {
                        observer.next(false);
                    }

                    subscription.unsubscribe();
                    observer.complete();
                },
                _err => {
                    subscription.unsubscribe();
                    observer.next(false);
                    observer.complete();
                });
        });
    }

    getTable(tableId: string): Observable<Table> {
        return new Observable<Table>(observer => {
            const table = new Table(this.documentForId(tableId), this.injector),
                s = table.ready$.subscribe(
                    ready => {
                        if (ready) {
                            s.unsubscribe();
                            observer.next(table);
                            observer.complete();
                        }
                    },
                    err => {
                        s.unsubscribe();
                        observer.error(err);
                    }
                );
        });
    }

    createTable(): Observable<Table> {
        return new Observable<Table>(observer => {
            const tableId = (100000 + Math.floor(Math.random() * 1000000)).toString(10),
                tableState = <TableState>{
                    id: tableId,
                    players: [],
                    clues: [],
                    cards: []
                },
                doc = this.documentForId(tableId);

            doc.set(tableState);

            const table = new Table(doc, this.injector),
                s = table.ready$.subscribe(
                    ready => {
                        if (ready) {
                            table.resetForNewGame();
                            table.sendUpdate();

                            s.unsubscribe();
                            observer.next(table);
                            observer.complete();
                        }
                    },
                    err => {
                        s.unsubscribe();
                        observer.error(err);
                    }
                );
        });
    }

    private tableStateCollection(): AngularFirestoreCollection<TableState> {
        return runInInjectionContext(this.injector, () => this.firestore.collection<TableState>('tables'));
    }

    private documentForId(tableId: string): AngularFirestoreDocument<TableState> {
        return runInInjectionContext(this.injector, () => this.tableStateCollection().doc<TableState>(tableId));
    }
}
