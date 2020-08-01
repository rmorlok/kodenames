import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { DeviceService } from '@services/device.service';
import { GameService } from '@services/game.service';
import { DeviceState, Game, Player } from '@models';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';

type UIMode = 'create-player' | 'pick-game' | 'lobby' | 'play';

@Component({
  selector: 'kod-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  items: Observable<any[]>;
  stateSubscription: Subscription | null;
  loadingGame = false;
  game: Game | null;
  state: DeviceState | null;

  isHandset$: Observable<boolean> = this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map(result => result.matches));

  constructor(
      private deviceService: DeviceService,
      private gameService: GameService,
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
    } else if (!this.state?.gameId) {
      return 'pick-game';
    } else if (this.game && (!this.game.started || !this.myPlayer)) {
      return 'lobby';
    } else {
      return 'play';
    }
  }

  get myPlayer(): Player | null {
    return this.game?.getPlayer(this.state.person);
  }

  get isSpymaster(): boolean {
    return !!this.myPlayer?.spymaster;
  }

  leaveGame(): void {
    this.game.removePlayer(this.state.person);
    this.game.sendUpdate();
    this.deviceService.clearGameId();
  }

  logout(): void {
    this.leaveGame();
    this.deviceService.clearPerson();
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
