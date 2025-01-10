import { ChangeDetectionStrategy, Component, EventEmitter, Input, Optional, Output, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { OnlyNumberDirective } from '../../../directives/number/only-number.directive';
import { CommonModule } from '@angular/common';
import { FormService } from '../../../services/form-service.service';


@Component({
  selector: 'input-phone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputPhoneComponent,
      multi: true,
    },
  ],
  standalone: true,
  imports: [CommonModule, MatInputModule, ReactiveFormsModule, OnlyNumberDirective,],
  templateUrl: './input-phone.component.html',
  styles: [
    `
  .full-width{
    width: 100%;
}
.field-no-error {
  width: 100%;
  margin: 0px;
}
    `,
  ],

})
export class InputPhoneComponent implements ControlValueAccessor {
  @ViewChild(FormControlDirective, { static: true })
  formControlDirective!: FormControlDirective;
  @Input() formControl!: FormControl;
  @Input() formControlName!: string;
  @Input() label: string | null = null;
  @Input() maxCharacters: string | null = null;
  @Input() minCharacters: string | null = null;
  @Input() suffix?: string;
  @Input() type: string = 'text';
  @Input() showMessageError: boolean = true;

  @Output() touched = new EventEmitter<void>();
  @Output() enter = new EventEmitter<void>();

  get control(): FormControl<any> {
    return this.formControl ||
      this._controlContainer.control?.get(this.formControlName);
  }

  constructor(@Optional() private readonly _controlContainer: ControlContainer,
    public formService: FormService) {

  }

  registerOnTouched(fn: any): void {
    this.formControlDirective.valueAccessor?.registerOnTouched(fn);
  }

  registerOnChange(fn: any): void {
    this.formControlDirective.valueAccessor?.registerOnChange(fn);
  }

  writeValue(obj: any): void {
    this.formControlDirective.valueAccessor?.writeValue(obj);
  }

  setDisabledState(isDisabled: boolean): void {
    this.formControlDirective.valueAccessor?.setDisabledState?.(isDisabled);
  }

  // Event handlers
  onTouched(): void {
    this.touched.emit();
  }


  onEnter(): void {
    this.enter.emit();
  }
}
