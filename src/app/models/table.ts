import { Player } from './player';
import { Clue } from './clue';
import { Card, CardColor } from './card';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import Words from '../../assets/data/words.json';
import { Person } from './person';
import { reverseTeam, Team } from './team';

export interface TableState {
  id: string;
  started: boolean;
  players: Player[];
  clues: Clue[];
  cards: Card[]; // This is a linear array of CARD_ROWS x CARD_COLUMNS elements
}

export const CARD_ROWS = 5;
export const CARD_COLUMNS = 5;

export class Table implements TableState {
  private readySubject = new BehaviorSubject<boolean>(false);

  constructor(
      private stateDoc: AngularFirestoreDocument<TableState>
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

  set started(val: boolean) {
    if (this.state) {
      this.state.started = val;
    }
  }

  get winner(): Team | null {
    if (this.state) {
      // Check for someone chosing the black card
      for (const clue of this.clues) {
        for (const card of clue.chosenCards) {
          if (card.color === 'black') {
            return reverseTeam(clue.team);
          }
        }
      }

      if (this.redRemaining === 0) {
        return 'red';
      } else if (this.blueRemaining === 0) {
        return 'blue';
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  get blueRemaining(): number {
    return this.remaining('blue');
  }

  get redRemaining(): number {
    return this.remaining('red');
  }

  get validToPlay(): boolean {
    return this.redPlayers.length >= 2
        && this.bluePlayers.length >= 2
        && !!this.redSpymaster
        && !!this.blueSpymaster;
  }

  private state: TableState | null;
  private subscription: Subscription;

  remaining(team: Team): number {
    let left = 0;

    for (const card of this.cards) {
      if (!card.revealed) {
        if (card.color === team) {
          left++;
        }
      }
    }

    return left;
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

  get redSpymaster(): Player | null {
    return this.spymasterForTeam('red');
  }

  get blueSpymaster(): Player | null {
    return this.spymasterForTeam('blue');
  }

  spymasterForTeam(team: Team): Player | null {
    const ps = this.players.filter(p => p.team === team && p.spymaster);

    if (ps.length >= 1) {
      return ps[0];
    } else {
      return null;
    }
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

    if (!this.validToPlay && this.state) {
      this.state.started = false;
    }
  }

  cardFor(row: number, col: number): Card | null {
    if (row < 0 || row >= CARD_ROWS || col < 0 || col >= CARD_COLUMNS) {
      throw new Error(`Position ${row}, ${col} is outside 0-${CARD_ROWS},0-${CARD_COLUMNS}`);
    }

    const pos = this.indexFor(row, col);

    if (pos >= this.cards.length) {
      return null;
    } else {
      return this.cards[pos];
    }
  }

  private indexFor(row: number, col: number): number {
    return row * CARD_COLUMNS + col;
  }

  private newCards(): Card[] {
    const wrds = [...Words],
        redFirst = Math.random() > 0.5,
        cardColors = Table.repeat('red', redFirst ? 9 : 8).concat(
            Table.repeat('blue', redFirst ? 8 : 9)
        ).concat(
            ['black']
        ).concat(
            Table.repeat('yellow', (CARD_ROWS * CARD_COLUMNS) - 9 - 8 - 1)
        );

    const cards = <Card[]>[];

    for (let r = 0; r < CARD_ROWS; r++) {
      for (let c = 0; c < CARD_COLUMNS; c++) {
        cards.push({
          word: Table.popRandom(wrds, 'ERROR'),
          revealed: false,
          color: Table.popRandom(cardColors, 'black')
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
