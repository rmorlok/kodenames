import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DeviceService } from '@services/device.service';
import { TableService } from '@services/table.service';
import { DeviceState, Table, Player } from '@models';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { GiveClueComponent, GiveClueData } from '@views/give-clue/give-clue.component';

type UIMode = 'create-player' | 'pick-table' | 'lobby' | 'play';

@Component({
  selector: 'kod-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit, OnDestroy {
  stateSubscription: Subscription | null;
  loadingTable = false;
  table: Table | null;
  state: DeviceState | null;

  isHandset$: Observable<boolean> = this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map(result => result.matches));

  constructor(
      private deviceService: DeviceService,
      private tableService: TableService,
      private breakpointObserver: BreakpointObserver,
      private dialog: MatDialog
  ) {
  }

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
      this.stateSubscription = null;
    }
  }

  ngOnInit(): void {
    this.stateSubscription = this.deviceService.state$().subscribe((state) => {
      this.updateState(state);
    });
  }

  get mode(): UIMode {
    if (!this.state?.person) {
      return 'create-player';
    } else if (!this.state?.tableId) {
      return 'pick-table';
    } else if (this.table && (!this.table.started || !this.myPlayer)) {
      return 'lobby';
    } else {
      return 'play';
    }
  }

  get myPlayer(): Player | null {
    return this.table?.getPlayer(this.state.person);
  }

  get isSpymaster(): boolean {
    return !!this.myPlayer?.spymaster;
  }

  get canGiveClue(): boolean {
    return this.table && this.table.canGiveClue(this.myPlayer);
  }

  get canPass(): boolean {
    return this.table && this.table.canPass(this.myPlayer);
  }

  get showNewGame(): boolean {
    return !!this.table?.winner;
  }

  endGame(): void {
    this.table.started = false;
    this.table.sendUpdate();
  }

  leaveTable(): void {
    this.table.removePlayer(this.state.person);
    this.table.sendUpdate();
    this.deviceService.clearTableId();
  }

  logout(): void {
    this.leaveTable();
    this.deviceService.clearPerson();
  }

  pass(): void {
    this.table.pass();
  }

  newGame(): void {
    this.table.returnToLobby();
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

  giveClue(): void {
    this.dialog.open(GiveClueComponent, {
      data: <GiveClueData>{
        table: this.table,
        myPlayer: this.myPlayer
      },
      width: '600px',
    });
  }

  private updateState(state: DeviceState) {
    if (!state.tableId) {
      this.table = null;
    } else if (state?.tableId !== this.table?.id) {
      this.table = null;
      this.loadingTable = true;
      const s = this.tableService.getTable(state.tableId).subscribe(table => {
        s.unsubscribe();
        this.table = table;
        this.loadingTable = false;
      });
    }

    this.state = state;
  }
}
