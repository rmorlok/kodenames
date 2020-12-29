import { Component, Input } from '@angular/core';
import { Table, CARD_COLUMNS, CARD_ROWS, CardColor } from '@models';

@Component({
  selector: 'kod-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent {
  @Input()
  table: Table | null;

  @Input()
  isSpymaster: boolean;

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

  show(row: number, col: number, color: CardColor): boolean {
    if (this.isSpymaster) {
      return !this.table.cardFor(row, col).revealed && this.table.cardFor(row, col).color === color;
    } else {
      return this.table.cardFor(row, col).revealed && this.table.cardFor(row, col).color === color;
    }
  }
}
