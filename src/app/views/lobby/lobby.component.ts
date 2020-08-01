import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DeviceService } from '@services/device.service';
import { TableService } from '@services/table.service';
import { DeviceState, Table, Player, Team } from '@models';

@Component({
  selector: 'kod-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
  @Input()
  table: Table | null;

  @Input()
  state: DeviceState | null;

  constructor() {}

  get myPlayer(): Player | null {
    return this.table?.getPlayer(this.state?.person);
  }

  setTeam($event: {value: Team}): void {
    if (!this.table || !this.state?.person) {
      return;
    }

    let p = this.myPlayer;

    if (!p) {
      p = <Player>{
        person: this.state.person,
        team: $event.value,
        spymaster: false
      };
      this.table.players.push(p);
    } else {
      p.team = $event.value;
    }

    this.table.sendUpdate();
  }

  startGame(): void {

  }
}
