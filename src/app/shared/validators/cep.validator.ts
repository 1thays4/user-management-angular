import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CepValidator {
  static valido(): ValidatorFn {
    return (controle: AbstractControl): ValidationErrors | null => {
      if (!controle.value) {
        return null;
      }

      const padraoCep = /^\d{5}-?\d{3}$/;
      return padraoCep.test(controle.value) ? null : { invalidCep: true };
    };
  }

  static limparCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }
}
