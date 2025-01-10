import { Directive, ElementRef, HostListener, Optional, Self, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[currencyFormatter]',
  standalone: true
})
export class CurrencyFormatterDirective implements OnInit {
  private decimalSeparator = ',';
  private thousandsSeparator = '.';

  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Optional() @Self() private control: NgControl
  ) { }

  ngOnInit() {
    if (this.control?.control && this.control.control.value !== null && this.control.control.value !== '') {
      const initialValue = this.formatInitialValue(this.control.control.value ?? 0);
      this.el.nativeElement.value = initialValue;
    }
  }

  formatStaticValue(value: number | string): string {
    if (value === null || value === undefined || value === '') return '';

    const numValue = typeof value === 'string'
      ? parseFloat(value)
      : value;

    if (isNaN(numValue)) return '';

    const intValue = Math.round(numValue * 100);

    const valueStr = intValue.toString();
    const integerPart = valueStr.slice(0, -2) || '0';
    const decimalPart = valueStr.slice(-2);

    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formattedInteger},${decimalPart}`;
  }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {
    const input = this.el.nativeElement;
    let value = input.value.replace(/[^0-9]/g, '');
    const formattedValue = this.formatInputValueWithDecimalGuide(value);
    input.value = formattedValue;
    const numericValue = parseFloat(value) / 100;

    if (this.control?.control) {
      this.control.control.setValue(numericValue, {
        emitEvent: false,
        emitModelToViewChange: false
      });
    }
  }

  @HostListener('blur')
  onBlur() {
    const input = this.el.nativeElement;
    let value = input.value.replace(/[^0-9]/g, '');

    if (value) {
      input.value = this.formatFinalValue(value);
    } else {
      input.value = '';
    }
  }

  @HostListener('focus')
  onFocus() {
    const input = this.el.nativeElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  private formatInitialValue(value: number | string): string {
    const numValue = typeof value === 'string'
      ? parseFloat(value)
      : value;

    if (isNaN(numValue)) return '';

    const intValue = Math.round(numValue * 100);
    return this.formatInputValueWithDecimalGuide(intValue.toString());
  }

  private formatInputValueWithDecimalGuide(value: string): string {
    if (value.length <= 2) return value;

    const integerPart = value.slice(0, -2);
    const decimalPart = value.slice(-2);
    const formattedInteger = this.formatInteger(integerPart);

    return `${formattedInteger}${this.decimalSeparator}${decimalPart}`;
  }

  private formatInteger(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
  }

  private formatFinalValue(value: string): string {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) return '';

    return new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(numValue / 100);
  }
}
