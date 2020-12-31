import { Component, Inject, Input } from '@angular/core';
import { Table, CARD_COLUMNS, CARD_ROWS, CardColor, Player, Clue } from '@models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';

export interface GiveClueData {
  table: Table;
  myPlayer: Player;
}

@Component({
  templateUrl: './give-clue.component.html',
  styleUrls: ['./give-clue.component.scss'],
})
export class GiveClueComponent {
  formGroup = this.fb.group({
    clue: ['', Validators.required],
    guesses: ['', Validators.required]
  });

  constructor(
      public dialogRef: MatDialogRef<GiveClueComponent>,
      @Inject(MAT_DIALOG_DATA) public data: GiveClueData,
      public fb: FormBuilder,
  ) {}

  get maxGuesses(): number {
    return this.data.table.remaining(this.data.myPlayer.team);
  }

  giveClue() {
    this.data.table.clues.push(<Clue>{
      team: this.data.myPlayer.team,
      value: this.clue,
      count: this.guesses,
      chosenCards: [],
      done: false
    });
    this.data.table.sendUpdate();
    this.dialogRef.close();
  }

  get clueFormControl(): AbstractControl {
    return this.formGroup.get('clue');
  }

  get clue(): string {
    return this.clueFormControl.value;
  }

  get guessesFormControl(): AbstractControl {
    return this.formGroup.get('guesses');
  }

  get guesses(): number | 'unlimited' {
    if (this.guessesFormControl.value === 'unlimited') {
      return 'unlimited';
    } else {
      return Number(this.guessesFormControl.value);
    }
  }
}
