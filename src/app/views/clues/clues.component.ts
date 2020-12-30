import { Component, Input } from '@angular/core';
import { Table, CARD_COLUMNS, CARD_ROWS, CardColor, Player, Clue } from '@models';

@Component({
  selector: 'kod-clues',
  templateUrl: './clues.component.html',
  styleUrls: ['./clues.component.scss'],
})
export class CluesComponent {
  @Input()
  table: Table | null;

  @Input()
  myPlayer: Player;

  constructor() {}

  iconForClue(clue: Clue, isLast: boolean): string {
    if (clue.chosenCards.some(card => card.color !== clue.team)) {
      return 'close';
    } else if (clue.chosenCards.length === clue.count && clue.chosenCards.every(card => card.color === clue.team)) {
      return 'check';
    } else if (!clue.passed && isLast) {
      return 'double_arrow';
    } else {
      return 'radio_button_unchecked';
    }
  }
}
