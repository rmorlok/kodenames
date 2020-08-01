import { Component, Input } from '@angular/core';
import { Game, GAME_COLUMNS, GAME_ROWS } from '@models';

@Component({
  selector: 'kod-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent {
  @Input()
  game: Game | null;

  @Input()
  isSpymaster: boolean;

  constructor() {}

  get rowCount(): number {
    if (this.game) {
      return GAME_ROWS;
    } else {
      return 0;
    }
  }

  get columnCount(): number {
    if (this.game) {
      return GAME_COLUMNS;
    } else {
      return 0;
    }
  }
}
