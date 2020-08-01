import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { DeviceService } from '@services/device.service';
import { GameService } from '@services/game.service';
import { GameIdValidator } from '@app/validators/game-id.validator';

@Component({
  selector: 'kod-pick-game',
  templateUrl: './pick-game.component.html',
  styleUrls: ['./pick-game.component.scss'],
})
export class PickGameComponent {
  editForm = this.fb.group({
    gameId: [
        '',
      Validators.required,
      this.gameIdValidator.validate.bind(this.gameIdValidator)
    ]
  });

  constructor(
      protected fb: FormBuilder,
      private deviceService: DeviceService,
      private gameService: GameService,
      private gameIdValidator: GameIdValidator
  ) {}

  get formGameId(): AbstractControl | null {
    return this.editForm.get('gameId');
  }

  get gameIdValue(): string | null {
    return this.formGameId.value as string;
  }

  set gameIdValue(v: string | null) {
    this.formGameId.setValue(v);
  }

  join(): void {
    if (this.editForm.valid) {
      this.deviceService.setGameId(this.gameIdValue);
    }
  }

  createGame(): void {
    const s = this.gameService.createGame().subscribe(game => {
      s.unsubscribe();
      this.deviceService.setGameId(game.id);
    });
  }
}
