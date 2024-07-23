import { AbstractControl, ValidatorFn } from '@angular/forms';

export function minDateValidator(minDate: Date): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }
    
    const inputDate = new Date(control.value);
    if (inputDate < minDate) {
      return { 'minDate': { value: control.value } };
    }
    
    return null;
  };
}