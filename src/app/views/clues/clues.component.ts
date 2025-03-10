import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Table, CARD_COLUMNS, CARD_ROWS, CardColor, Player, Clue } from '@models';
import { GiveClueComponent, GiveClueData } from '@views/give-clue/give-clue.component';
import { MatDialog } from '@angular/material/dialog';
import { AudioService } from '@services/audio.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'kod-clues',
  templateUrl: './clues.component.html',
  styleUrls: ['./clues.component.scss'],
})
export class CluesComponent implements OnInit, OnDestroy {
  @Input()
  table: Table | null;

  @Input()
  myPlayer: Player;

  private previousCluesLength = 0;
  private tableSubscription: Subscription;

  constructor(
      private dialog: MatDialog,
      private audioService: AudioService
  ) {}

  ngOnInit() {
    // Subscribe to table changes to detect new clues
    this.tableSubscription = this.table?.onUpdate.subscribe(() => {
      if (this.table && this.table.clues.length > this.previousCluesLength) {
        const latestClue = this.table.clues[this.table.clues.length - 1];
        // Only play sound if we're not the spymaster who gave the clue
        if (!this.myPlayer?.spymaster || this.myPlayer?.team !== latestClue.team) {
          this.audioService.playDing();
        }
      }
      this.previousCluesLength = this.table?.clues.length || 0;
    });
  }

  ngOnDestroy() {
    this.tableSubscription?.unsubscribe();
  }

  iconForClue(clue: Clue, isLast: boolean): string {
    if (clue.chosenCards.some(card => card.color !== clue.team)) {
      return 'close';
    } else if (this.table.currentClueHasGuessesLeft && isLast) {
      return 'double_arrow';
    } else if (clue.count != 'unlimited' && clue.chosenCards.length >= clue.count && clue.chosenCards.every(card => card.color === clue.team)) {
      return 'check';
    } else {
      return 'radio_button_unchecked';
    }
  }

  cluePassed(clue: Clue): boolean {
    if (clue.count === 'unlimited' || clue.count === 0) {
      return false;
    } else {
      return clue.done && clue.chosenCards.filter(card => card.color === clue.team).length < clue.count;
    }
  }

  get canGiveClue(): boolean {
    return this.table && this.table.canGiveClue(this.myPlayer);
  }

  get canPass(): boolean {
    return this.table && this.table.canPass(this.myPlayer);
  }

  get passText(): string {
    if (this.canPass && this.table.currentClue) {
      const currentClue = this.table.currentClue;
      if (currentClue.count === 'unlimited' ||
          currentClue.count === 0 ||
          currentClue.count <= currentClue.chosenCards.length) {
        return 'Done';
      } else {
        return 'Pass';
      }
    } else {
      return '';
    }
  }

  get waitingForClue(): boolean {
    return this.table?.waitingOnClue;
  }

  get pendingClueSpymasterName(): string | null {
    switch(this.table?.turn) {
      case 'blue':
        if (this.myPlayer.person.uuid === this.table.blueSpymaster.person.uuid) {
          return 'you';
        } else {
          return this.table.blueSpymaster.person.name;
        }
      case 'red':
        if (this.myPlayer.person.uuid === this.table.redSpymaster.person.uuid) {
          return 'you';
        } else {
          return this.table.redSpymaster.person.name;
        }
      default:
        return null;
    }
  }

  giveClue() {
    this.dialog.open(GiveClueComponent, {
      data: <GiveClueData>{
        table: this.table,
        myPlayer: this.myPlayer
      }
    });
  }

  pass() {
    this.table.pass();
  }
}
