import {
  Component,
  Input,
  Optional,
  OnDestroy,
  ChangeDetectionStrategy,
  OnInit,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild
} from '@angular/core';
import {
  ReactiveFormsModule,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  FormControlDirective,
  ControlContainer
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { Observable, Subject, debounceTime, takeUntil, distinctUntilChanged, startWith } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { FormService } from '../../../services/form-service.service';

@Component({
  selector: 'custom-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: InputCustomComponent,
      multi: true,
    },
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  templateUrl: './input-custom.component.html',
  styleUrl: './input-custom.component.css'
})
export class InputCustomComponent implements ControlValueAccessor, OnInit, OnDestroy {

  @ViewChild(FormControlDirective, { static: true })
  formControlDirective!: FormControlDirective;
  @Input() formControl!: FormControl;
  @Input() formControlName!: string;

  @Input() inputType: 'input' | 'textarea' | 'select' | 'autocomplete' = 'input';
  @Input() type: 'text' | 'number' | 'email' | 'password' | 'tel' = 'text';
  @Input() label:string | null = null;
  @Input() placeholder = '';
  @Input() maxCharacters: string | null = null;
  @Input() minCharacters: string | null = null;
  @Input() min?: number;
  @Input() max?: number;
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() showCharCount = false;

  @Input() rows:string = '3';

  @Input() multiple = false;

  @Input() displayFn: ((item: any) => string) | null = null;
  @Input() filteredOptions!: Observable<any[]> | null;
  @Input() isEditMode: boolean = false;

  @Input() options: any[] = [];

  @Input() displayProperty!: string;
  @Input() valueProperty!: string;

  @Output() optionSelected = new EventEmitter<any>();
  @Output() inputChange = new EventEmitter<any>();
  @Output() touched = new EventEmitter<void>();
  @Output() enter = new EventEmitter<void>();

  @ViewChild('inputElement') inputElement?: ElementRef;
  @ViewChild('autoCompleteInput') autoCompleteInput?: ElementRef;
  @ViewChild('textareaElement') textareaElement?: ElementRef;

  private readonly destroy$ = new Subject<void>();

  get control(): FormControl<any> {
    const control = this.formControl || (this.formControlName && this._controlContainer?.control?.get(this.formControlName)) as FormControl;
    if (!control) {
      console.error(`Control not found for formControlName: ${this.formControlName}`);
    }
    return control;
  }

  constructor(@Optional() private readonly _controlContainer: ControlContainer,
    public formService: FormService) {

  }

  ngOnInit(): void {
    if (!this.formControl && !this.formControlName) {
      throw new Error('InputCustomComponent: Either formControl or formControlName must be provided.');
    }

    this.setupValueChanges();
    this.validateInputType();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.optionSelected.emit(event);
  }


  onSelectionChange(event: MatSelectChange): void {
    this.optionSelected.emit(event.value);
  }

  // Utility methods
  private setupValueChanges(): void {
    if (this.control) {
      this.control.valueChanges.pipe(
        startWith(this.control.value), // Emitir el valor actual al suscribirse
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(value => this.inputChange.emit(value));
    }
  }

  private validateInputType(): void {
    const validTypes = ['input', 'textarea', 'select', 'autocomplete'];
    if (!validTypes.includes(this.inputType)) {
      this.inputType = 'input';
    }
  }

  focus(): void {
    const element = this.inputElement ||
      this.autoCompleteInput ||
      this.textareaElement;
    element?.nativeElement?.focus();
  }

  getDisplayText(option: any): string {
    if (!option) {
      return '';
    }
    if (this.displayFn) {
      return this.displayFn(option);
    }
    if (this.displayProperty && option[this.displayProperty]) {
      return option[this.displayProperty];
    }
    return `Sin propiedad`;
  }
}