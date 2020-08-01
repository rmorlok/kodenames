import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DeviceService } from '@services/device.service';
import { TableService } from '@services/table.service';
import { DeviceState, Table, Player } from '@models';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

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

  leaveTable(): void {
    this.table.removePlayer(this.state.person);
    this.table.sendUpdate();
    this.deviceService.clearTableId();
  }

  logout(): void {
    this.leaveTable();
    this.deviceService.clearPerson();
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
