import { Injectable } from '@angular/core';
import {
    Table,
    TableState
} from '@models';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection } from '@angular/fire/firestore/collection/collection';

@Injectable({
    providedIn: 'root',
})
export class TableService {
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
            const table = new Table(this.documentForId(tableId)),
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

            const table = new Table(doc),
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
        return this.firestore.collection<TableState>('tables');
    }

    private documentForId(tableId: string): AngularFirestoreDocument<TableState> {
        return this.tableStateCollection().doc<TableState>(tableId);
    }
}
