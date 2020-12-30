import { Component, Input } from '@angular/core';
import { Table, CARD_COLUMNS, CARD_ROWS, CardColor, Player } from '@models';

@Component({
  selector: 'kod-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent {
  @Input()
  table: Table | null;

  @Input()
  myPlayer: Player;

  constructor() {}

  get rowCount(): number {
    if (this.table) {
      return CARD_ROWS;
    } else {
      return 0;
    }
  }

  get columnCount(): number {
    if (this.table) {
      return CARD_COLUMNS;
    } else {
      return 0;
    }
  }

  get isSpymaster(): boolean {
    return this.myPlayer.spymaster;
  }

  get iCanPick(): boolean {
    return !this.isSpymaster && this.table.turn === this.myPlayer.team;
  }

  isRevealed(row: number, col: number): boolean {
    return this.table.cardFor(row, col).revealed;
  }

  canPick(row: number, col: number): boolean {
    return this.iCanPick && !this.table.cardFor(row, col).revealed;
  }

  showRed(row: number, col: number): boolean {
    return this.show(row, col, 'red');
  }

  showBlue(row: number, col: number): boolean {
    return this.show(row, col, 'blue');
  }

  showYellow(row: number, col: number): boolean {
    return this.show(row, col, 'yellow');
  }

  showBlack(row: number, col: number): boolean {
    return this.show(row, col, 'black');
  }

  showGreen(row: number, col: number): boolean {
    if (this.isSpymaster) {
      return this.table.cardFor(row, col).revealed && this.table.cardFor(row, col).color === this.myPlayer.team;
    }
  }

  show(row: number, col: number, color: CardColor): boolean {
    return this.table.cardFor(row, col).color === color;
  }

  revealCard(row: number, col: number) {
    if (this.myPlayer.team === this.table.turn && !this.isSpymaster) {
      this.table.reveal(row, col);
    }
  }
}
