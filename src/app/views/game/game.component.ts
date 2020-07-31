import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DeviceService } from '@services/device.service';
import { GameService } from '@services/game.service';
import { DeviceState, Game } from '@models';

type UIMode = 'create-player' | 'pick-game' | 'play';

@Component({
  selector: 'kod-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit, OnDestroy {
  items: Observable<any[]>;
  stateSubscription: Subscription | null;
  loadingGame = false;
  game: Game | null;
  state: DeviceState | null;

  constructor(
      private deviceService: DeviceService,
      private gameService: GameService
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
    } else if (!this.state?.gameId) {
      return 'pick-game';
    } else {
      return 'play';
    }
  }

  private updateState(state: DeviceState) {
    if (!state.gameId) {
      this.game = null;
    } else if (state?.gameId !== this.game?.id) {
      this.game = null;
      this.loadingGame = true;
      const s = this.gameService.getGame(state.gameId).subscribe(game => {
        s.unsubscribe();
        this.game = game;
        this.loadingGame = false;
      });
    }

    this.state = state;
  }
}
