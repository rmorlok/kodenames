import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DeviceService } from '@services/device.service';
import { TableService } from '@services/table.service';
import { DeviceState, Table, Player, Team } from '@models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'kod-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent implements OnInit, OnDestroy {
  @Input()
  table: Table | null;

  private state: DeviceState | null;
  private stateSubscription: Subscription | null;

  constructor(
      private deviceService: DeviceService,
  ) {}

  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
      this.stateSubscription = null;
    }
  }

  ngOnInit(): void {
    this.stateSubscription = this.deviceService.state$().subscribe((state) => {
      this.state = state;
    });
  }

  get myPlayer(): Player | null {
    return this.table?.getPlayer(this.state?.person);
  }

  get ready(): boolean {
    return this.table?.validToPlay;
  }

  get gameInProgress(): boolean {
    return this.table?.started;
  }

  sortedPlayers(t: Team): Player[] {
    return this.table.playersForTeam(t).sort((p1, p2) => {
      if(p1.spymaster) {
        return -999;
      } else if (p2.spymaster) {
        return 999;
      } else {
        return p1.person.name.localeCompare(p2.person.name);
      }
    });
  }

  spyMaster(t: Team): Player | null {
    return this.table?.spymasterForTeam(t);
  }

  nonSpymasterPlayers(t: Team): Player[] {
    return (this.table.playersForTeam(t) || []).filter(p => !p.spymaster);
  }

  makeSpymaster(): void {
    if (!this.table || !this.myPlayer) {
      return;
    }

    this.table.playersForTeam(this.myPlayer.team).forEach(player => {
      player.spymaster = false;
    });

    this.myPlayer.spymaster = true;
    this.table.sendUpdate();
  }

  setTeam(team: Team): void {
    if (!this.table || !this.state?.person) {
      return;
    }

    let p = this.myPlayer;

    if (!p) {
      p = <Player>{
        person: this.state.person,
        team: team,
        spymaster: false
      };
      this.table.players.push(p);
    } else {
      p.team = team;
      p.spymaster = false;
    }

    this.table.sendUpdate();
  }

  remove(player: Player): void {
    if (this.myPlayer?.person?.uuid === player.person.uuid) {
      this.deviceService.clearTableId();
    }

    this.table.removePlayer(player.person);
    this.table.sendUpdate();
  }

  leave(): void {
    if (this.myPlayer) {
      this.table.removePlayer(this.state?.person);
      this.table.sendUpdate();
    }

    this.deviceService.clearTableId();
  }

  logout(): void {
    this.leave();
    this.deviceService.clearPerson();
  }

  startGame(): void {
    this.table.resetForNewGame();
    this.table.started = true;
    this.table.sendUpdate();
  }
}
