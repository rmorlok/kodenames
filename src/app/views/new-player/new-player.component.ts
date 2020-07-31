import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { DeviceService } from '@services/device.service';

@Component({
  selector: 'kod-new-player',
  templateUrl: './new-player.component.html',
  styleUrls: ['./new-player.component.css'],
})
export class NewPlayerComponent {
  editForm = this.fb.group({
    name: ['', Validators.required]
  });

  constructor(
      protected fb: FormBuilder,
      private deviceService: DeviceService,
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

  createPerson(): void {
    this.deviceService.setNewPerson(this.nameValue);
  }
}
