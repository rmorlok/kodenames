import { Component, Input } from '@angular/core';
import { Table, CARD_COLUMNS, CARD_ROWS, CardColor } from '@models';

@Component({
    selector: 'kod-score',
    templateUrl: './score.component.html',
    styleUrls: ['./score.component.scss'],
    standalone: false
})
export class ScoreComponent {
  @Input()
  table: Table | null;

  constructor() {}
}
