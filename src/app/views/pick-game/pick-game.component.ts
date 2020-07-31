import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { DeviceService } from '@services/device.service';
import { GameService } from '@services/game.service';

@Component({
  selector: 'kod-pick-game',
  templateUrl: './pick-game.component.html',
  styleUrls: ['./pick-game.component.css'],
})
export class PickGameComponent {
  editForm = this.fb.group({
    name: ['', Validators.required]
  });

  constructor(
      protected fb: FormBuilder,
      private deviceService: DeviceService,
      private gameService: GameService
  ) {}

  get formName(): AbstractControl | null {
    return this.editForm.get('name');
  }

  get nameValue(): string | null {
    return this.formName.value as string;
  }

  set nameValue(v: string | null) {
    this.formName.setValue(v);
  }

  createGame(): void {
    const s = this.gameService.createGame().subscribe(game => {
      s.unsubscribe();
      this.deviceService.setGameId(game.id);
    });
  }
}
