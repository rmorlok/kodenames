import { Player } from './player';
import { Clue } from './clue';
import { Card, CardColor } from './card';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import Words from '../../assets/data/words.json';
import { Person } from '@models/person';
import { Team } from '@models/team';

export interface GameState {
  id: string;
  started: boolean;
  players: Player[];
  clues: Clue[];
  cards: Card[]; // This is a linear array of GAME_ROWS x GAME_COLUMNS elements
}

export const GAME_ROWS = 5;
export const GAME_COLUMNS = 5;

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

  get started(): boolean {
    return !!this.state?.started;
  }

  private state: GameState | null;
  private subscription: Subscription;

  static popRandom<T>(arr: T[], fallback: T): T {
    if (arr.length === 0) {
      return fallback;
    }

    const chosen = Math.floor(Math.random() * arr.length),
        val = arr[chosen];
    arr.splice(chosen, 1);
    return val;
  }

  static repeat(v: CardColor, count: number): CardColor[] {
    const vals = [];

    for (let i = 0; i < count; i++) {
      vals.push(v);
    }

    return vals;
  }

  get redPlayers(): Player[] {
    return this.playersForTeam('red');
  }

  get bluePlayers(): Player[] {
    return this.playersForTeam('blue');
  }

  playersForTeam(team: Team): Player[] {
      return this.players.filter(p => p.team === team);
  }

  getPlayer(person: Person | null): Player | null {
    if (!person) {
      return null;
    }

    const filtered = this.players.filter(player => player.person.uuid === person.uuid);

    if (filtered.length === 0) {
      return null;
    } else {
      return filtered[0];
    }
  }

  removePlayer(person: Person): void {
    this.state.players = this.players.filter(player => player.person.uuid !== person.uuid);
  }

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
    return row * GAME_COLUMNS + col;
  }

  private newCards(): Card[] {
    const wrds = [...Words],
        redFirst = Math.random() > 0.5,
        cardColors = Game.repeat('red', redFirst ? 9 : 8).concat(
            Game.repeat('blue', redFirst ? 8 : 9)
        ).concat(
            ['black']
        ).concat(
            Game.repeat('yellow', (GAME_ROWS * GAME_COLUMNS) - 9 - 8 - 1)
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
