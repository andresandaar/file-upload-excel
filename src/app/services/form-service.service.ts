import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormService {

  private readonly errorMessages: { [key: string]: string | ((error: any) => string) } = {
    required: 'Este campo es requerido.',
    minlength: (error: any) => `Mínimo ${error.requiredLength} caracteres.`,
    maxlength: (error: any) => `Máximo ${error.requiredLength} caracteres.`,
    email: 'Formato de email no válido.',
    pattern: 'El formato ingresado no es válido.',
    patternPositiveInteger: 'El valor debe ser un número válido.',
    patternUrlWeb: 'La URL no es válida.',
    patternDecimalNumberOne: 'El valor debe ser un número con un máximo de 2 decimales (1.00) y separador de miles.',
    matDatepickerParse: 'La fecha es invalida.',
    min: (error: any) => `El valor debe ser mayor o igual a ${error.min}`,
    max: (error: any) => `El valor debe ser menor o igual a ${error.max}`,
    maxPiso: (error: any) => error?.pisoPermitido
      ? `Pisos máximos permitidos según la Sede: ${error.pisoPermitido}.`
      : 'Valor inválido para el piso.'
  };

  /**
   * Verifica si un control específico del formulario es inválido.
   * @param controlFormName Nombre del control en el formulario.
   */
  invalid(control: AbstractControl<any, any> | null): boolean {
    return !!(control?.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtiene el mensaje de error correspondiente a un control específico del formulario.
   * @param control Control del formulario.
   */
  /**
 * Obtiene el mensaje de error correspondiente a un control específico del formulario.
 * @param control Control del formulario.
 */
  getErrorMessage(control: AbstractControl<any, any> | null): string | null {
    if (!control?.errors) {
      return '';
    }

    // Special case for required error when not a date picker parse error
    if (control.hasError('required') && !control.hasError('matDatepickerParse')) {
      return this.errorMessages['required'] as string;
    }

    if (control.hasError('required') && control.hasError('matDatepickerParse')) {
      return this.errorMessages['matDatepickerParse'] as string;
    }

    // Find first error that has a message handler
    const firstError = Object.keys(control.errors).find(key => key in this.errorMessages);

    if (!firstError) {
      return 'Campo no válido.';
    }

    const messageHandler: string | ((error: any) => string) = this.errorMessages[firstError];

    return typeof messageHandler === 'function'
      ? messageHandler(control.getError(firstError))
      : messageHandler;
  }
}
