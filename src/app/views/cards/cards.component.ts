import { Component, Input } from '@angular/core';
import { Table, CARD_COLUMNS, CARD_ROWS } from '@models';

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
}
