import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DeviceService } from '@services/device.service';
import { GameService } from '@services/game.service';
import { DeviceState, Game, Player, Team } from '@models';

@Component({
  selector: 'kod-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
})
export class LobbyComponent {
  @Input()
  game: Game | null;

  @Input()
  state: DeviceState | null;

  constructor(
      protected fb: FormBuilder,
      private deviceService: DeviceService,
      private gameService: GameService
  ) {}

  get myPlayer(): Player | null {
    return this.game?.getPlayer(this.state?.person);
  }

  setTeam($event: {value: Team}): void {
    if (!this.game || !this.state?.person) {
      return;
    }

    let p = this.myPlayer;

    if (!p) {
      p = <Player>{
        person: this.state.person,
        team: $event.value,
        spymaster: false
      };
      this.game.players.push(p);
    } else {
      p.team = $event.value;
    }

    this.game.sendUpdate();
  }

  startGame(): void {

  }
}
