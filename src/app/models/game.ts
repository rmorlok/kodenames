import { Player } from './player';
import { Clue } from './clue';
import { Card, CardColor } from './card';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import Words from '../../assets/data/words.json';

export interface GameState {
  id: string;
  players: Player[];
  clues: Clue[];
  cards: Card[]; // This is a linear array of GAME_ROWS x GAME_COLUMNS elements
}

const GAME_ROWS = 5;
const GAME_COLUMNS = 5;

export class Game implements GameState {
  private readySubject = new BehaviorSubject<boolean>(false);

  constructor(
      private stateDoc: AngularFirestoreDocument<GameState>
  ) {
      this.subscription = this.stateDoc.valueChanges().subscribe(gs => {
        this.state = gs;
        this.readySubject.next(true);
      });
  }

  get ready$(): Observable<boolean> {
    return this.readySubject.asObservable();
  }

  get id(): string {
    return this.state?.id || '';
  }

  get players(): Player[] {
    return this.state?.players || [];
  }

  get clues(): Clue[] {
    return this.state?.clues || [];
  }

  get cards(): Card[] {
    return this.state?.cards || [];
  }

  private state: GameState | null;
  private subscription: Subscription;

  cardFor(row: number, col: number): Card | null {
    if (row < 0 || row >= GAME_ROWS || col < 0 || col >= GAME_COLUMNS) {
      throw new Error(`Position ${row}, ${col} is outside 0-${GAME_ROWS},0-${GAME_COLUMNS}`);
    }

    const pos = this.indexFor(row, col);

    if (pos >= this.cards.length) {
      return null;
    } else {
      return this.cards[pos];
    }
  }

  private indexFor(row: number, col: number): number {
    return row * GAME_COLUMNS + col
  }

  static popRandom<T>(arr: T[], fallback: T): T {
    if (arr.length === 0) {
      return fallback;
    }

    const chosen = Math.floor(Math.random() * arr.length),
        val = arr[chosen];
    arr.splice(chosen, 1);
    return val;
  }

  private repeat(v: CardColor, count: number): CardColor[] {
    const vals = [];

    for (let i = 0; i < count; i++) {
      vals.push(v);
    }

    return vals;
  }

  private newCards(): Card[] {
    const wrds = [...Words],
        redFirst = Math.random() > 0.5,
        cardColors = this.repeat('red', redFirst ? 9 : 8).concat(
            this.repeat('blue', redFirst ? 8 : 9)
        ).concat(
            ['black']
        ).concat(
            this.repeat('yellow', (GAME_ROWS * GAME_COLUMNS) - 9 - 8 - 1)
        );

    const cards = <Card[]>[];

    for (let r = 0; r < GAME_ROWS; r++) {
      for (let c = 0; c < GAME_COLUMNS; c++) {
        cards.push({
          word: Game.popRandom(wrds, 'ERROR'),
          revealed: false,
          color: Game.popRandom(cardColors, 'black')
        });
      }
    }

    return cards;
  }

  sendUpdate(): void {
    this.stateDoc.update(this.state);
  }

  resetForNewGame(): void {
    this.state.clues = [];
    this.state.cards = this.newCards();
  }

  cleanUp(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}
