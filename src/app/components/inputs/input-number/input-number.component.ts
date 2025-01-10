import { ChangeDetectionStrategy, Component, Input, Optional, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { OnlyNumberDirective } from '../../../directives/number/only-number.directive';
import { CommonModule } from '@angular/common';
import { NgxCurrencyConfig, NgxCurrencyDirective } from 'ngx-currency';
import { FormService } from '../../../services/form-service.service';

@Component({
  selector: 'input-number',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputNumberComponent,
      multi: true,
    },
  ],
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    ReactiveFormsModule,
    OnlyNumberDirective,
    NgxCurrencyDirective,
  ],
  templateUrl: './input-number.component.html',
  styles: [
    `
  .full-width{
    width: 100%;
}
    `,
  ],

})
export class InputNumberComponent implements ControlValueAccessor {
  @ViewChild(FormControlDirective, { static: true })
  formControlDirective!: FormControlDirective;
  @Input() formControl!: FormControl;
  @Input() formControlName!: string;
  @Input() label!: string;
  @Input() maxCharacters: string | null = null;
  @Input() minCharacters: string | null = null;
  @Input() suffix?: string;
  @Input() type: string = 'text';
  @Input() currency: boolean = false;
  optionsCurrencyMask: NgxCurrencyConfig = {
    align: "left",
    allowNegative: false,
    allowZero: true,
    decimal: ",",
    precision: 2,
    prefix: "",
    suffix: "",
    thousands: ".",
    min: null,
    nullable: true
  };


  get control(): FormControl<any> {
    return this.formControl ||
      this._controlContainer.control?.get(this.formControlName);
  }

  constructor(@Optional() private readonly _controlContainer: ControlContainer, public formService: FormService) {

  }

  registerOnTouched(fn: any): void {
    if (this.formControlDirective?.valueAccessor) {
      this.formControlDirective.valueAccessor.registerOnTouched(fn);
    }
  }

  registerOnChange(fn: any): void {
    if (this.formControlDirective?.valueAccessor) {
      this.formControlDirective.valueAccessor.registerOnChange(fn);
    }
  }

  writeValue(obj: any): void {
    if (this.formControlDirective?.valueAccessor) {
      this.formControlDirective.valueAccessor.writeValue(obj);
    }
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.formControlDirective?.valueAccessor?.setDisabledState) {
      this.formControlDirective.valueAccessor.setDisabledState(isDisabled);
    }
  }

}
