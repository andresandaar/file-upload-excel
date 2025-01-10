import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';


export default class MyValidatorsForm {
    private static readonly numberPositiveInteger: RegExp = /^\d+$/;
    private static readonly urlWeb: RegExp = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,6}(\/[\w\-~:/?#[\]@!$&'()*+,;=]*)?$/i;
    private static readonly decimalNumberOne : RegExp =/^\d+(\.\d{1,2})?$/;

    /**
  * Validador para números Enteros positivos
  */
    static get patternPositiveInteger(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value || this.numberPositiveInteger.test(control.value)) {
                return null;
            }
            return { patternPositiveInteger: true };
        };
    }


    static get patternUrlWeb(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value || this.urlWeb.test(control.value)) {
                return null;
            }
            return { patternUrlWeb: true };
        };
    }

    static get patternDecimalNumberOne(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value || this.decimalNumberOne.test(control.value)) {
                return null;
            }
            return { patternDecimalNumberOne: true };
        };
    }

    /**
     * Validador para verificar que la fecha final no sea menor que la fecha de inicio
     * @param startDateControlName Nombre del control que contiene la fecha de inicio
     * @param endDateControlName Nombre del control que contiene la fecha de fin
     */
    static fechasValidator(startDateControlName: string, endDateControlName: string): ValidationErrors | null {
        return (formGroup: FormGroup) => {
            const startDateControl = formGroup.controls[startDateControlName];
            const endDateControl = formGroup.controls[endDateControlName];

            const startDate: string = startDateControl?.value;
            const endDate: string = endDateControl?.value;

            // Validación si las fechas están presentes y son válidas
            if (!startDate || !endDate) {
                return null;
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            // Validación si  la fecha de inicio es mayor que la fecha de fin
            if (start > end) {
                endDateControl?.setValue(null);
                return {
                    fechasInvalidas: {
                        messageError: `La fecha fin no puede ser superior a la fecha de inicio`,
                    }
                };
            }

            return null; // Si las fechas son correctas
        };
    }

}