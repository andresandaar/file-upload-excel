import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormService } from '../../../services/form-service.service';


@Component({
  selector: 'input-date',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputDateComponent,
      multi: true,
    },
  ],
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule
  ],
  templateUrl: './input-date.component.html',
  styles: [
    `
    .full-width {
      width: 100%;
    }
    .field-no-error {
  width: 100%;
  margin: 0px;
}
    `,
  ],
})
export class InputDateComponent implements ControlValueAccessor, OnInit {
  @ViewChild(FormControlDirective, { static: true })
  formControlDirective!: FormControlDirective;
  @Input() formControl!: FormControl;
  @Input() formControlName!: string;
  @Input() label: string | null = null;
  @Input() invalidForm: boolean = false;
  @Input() messageError: string = '';
  @Input() fechaMinimaControl!: AbstractControl<any, any> | null;
  @Input() showMessageError: boolean = true;

  @Output() touched = new EventEmitter<void>();
  @Output() dateChange = new EventEmitter<void>();
  @Output() enter = new EventEmitter<void>();
  fechaMinima!: Date | null;

  constructor(@Optional() private readonly _controlContainer: ControlContainer, public formService: FormService, private readonly cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    if (this.fechaMinimaControl) {
      this.fechaMinimaControl.statusChanges.subscribe(() => {
        this.fechaMinima = this.fechaMinimaControl?.value
        this.cdr.detectChanges();
      });
    }
  }

  get control(): FormControl<any> {
    return this.formControl ||
      this._controlContainer.control?.get(this.formControlName);
  }

  // ControlValueAccessor implementation
  writeValue(obj: any): void {
    if (this.formControlDirective?.valueAccessor) {
      this.formControlDirective.valueAccessor.writeValue(obj);
    }
  }

  registerOnChange(fn: any): void {
    if (this.formControlDirective?.valueAccessor) {
      this.formControlDirective.valueAccessor.registerOnChange(fn);
    }
  }

  registerOnTouched(fn: any): void {
    if (this.formControlDirective?.valueAccessor) {
      this.formControlDirective.valueAccessor.registerOnTouched(fn);
    }
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.formControlDirective?.valueAccessor?.setDisabledState) {
      this.formControlDirective.valueAccessor.setDisabledState(isDisabled);
    }
  }

  // Event handlers
  onTouched(): void {
    this.touched.emit();
  }


  onEnter(): void {
    this.enter.emit();
  }

  onDateChange(event: any): void {
    this.dateChange.emit(event);
  }
}
