// import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
// import { catchError, map } from 'rxjs/operators';
// import { Observable, of } from 'rxjs';
// import { DuplicatecheckService } from '../../services/duplicateCheckValidator/duplicatecheck.service';


// export function codeDuplicateValidator(duplicateCheckService: DuplicatecheckService): AsyncValidatorFn {
//   return (control: AbstractControl): Observable<ValidationErrors | null> => {
//     return duplicateCheckService.getPmasterByCode(control.value).pipe(
//       map(isDuplicate => (isDuplicate ? { codeExists: true } : null)),
//       catchError(() => of(null))
//     );
//   };
// }