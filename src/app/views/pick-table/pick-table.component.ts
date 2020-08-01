import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { DeviceService } from '@services/device.service';
import { TableService } from '@services/table.service';
import { TableIdValidator } from '@app/validators/table-id.validator';

@Component({
  selector: 'kod-pick-table',
  templateUrl: './pick-table.component.html',
  styleUrls: ['./pick-table.component.scss'],
})
export class PickTableComponent {
  editForm = this.fb.group({
    tableId: [
        '',
      Validators.required,
      this.tableIdValidator.validate.bind(this.tableIdValidator)
    ]
  });

  constructor(
      protected fb: FormBuilder,
      private deviceService: DeviceService,
      private tableService: TableService,
      private tableIdValidator: TableIdValidator
  ) {}

  get formTableId(): AbstractControl | null {
    return this.editForm.get('tableId');
  }

  get tableIdValue(): string | null {
    return this.formTableId.value as string;
  }

  set tableIdValue(v: string | null) {
    this.formTableId.setValue(v);
  }

  join(): void {
    if (this.editForm.valid) {
      this.deviceService.setTableId(this.tableIdValue);
    }
  }

  createTable(): void {
    const s = this.tableService.createTable().subscribe(table => {
      s.unsubscribe();
      this.deviceService.setTableId(table.id);
    });
  }
}
