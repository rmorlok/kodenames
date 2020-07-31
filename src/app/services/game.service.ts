import { Injectable } from '@angular/core';
import {
    Game,
    GameState
} from '@models';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AngularFirestoreCollection } from '@angular/fire/firestore/collection/collection';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    constructor(
        private firestore: AngularFirestore
    ) {}

    getGame(gameId: string): Observable<Game> {
        return new Observable<Game>(observer => {
            const game = new Game(this.documentForId(gameId)),
                s = game.ready$.subscribe(
                    ready => {
                        if (ready) {
                            s.unsubscribe();
                            observer.next(game);
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

    createGame(): Observable<Game> {
        return new Observable<Game>(observer => {
            const gameId = Math.floor(Math.random() * 1000000).toString(10),
                gameState = <GameState>{
                    id: gameId,
                    players: [],
                    clues: [],
                    cards: []
                },
                doc = this.documentForId(gameId);

            doc.set(gameState);

            const game = new Game(doc),
                s = game.ready$.subscribe(
                    ready => {
                        if (ready) {
                            game.resetForNewGame();
                            game.sendUpdate();

                            s.unsubscribe();
                            observer.next(game);
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

    private gameStateCollection(): AngularFirestoreCollection<GameState> {
        return this.firestore.collection<GameState>('games');
    }

    private documentForId(gameId: string): AngularFirestoreDocument<GameState> {
        return this.gameStateCollection().doc<GameState>(gameId);
    }
}
