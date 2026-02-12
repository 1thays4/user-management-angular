import { FormControl } from '@angular/forms';
import { CepValidator } from './cep.validator';

describe('CepValidator', () => {
  describe('valido', () => {
    it('deve retornar null para CEP válido com hífen', () => {
      const controle = new FormControl('12345-678');
      const resultado = CepValidator.valido()(controle);
      expect(resultado).toBeNull();
    });

    it('deve retornar null para CEP válido sem hífen', () => {
      const controle = new FormControl('12345678');
      const resultado = CepValidator.valido()(controle);
      expect(resultado).toBeNull();
    });

    it('deve retornar null para valor vazio', () => {
      const controle = new FormControl('');
      const resultado = CepValidator.valido()(controle);
      expect(resultado).toBeNull();
    });

    it('deve retornar invalidCep para CEP com menos de 8 dígitos', () => {
      const controle = new FormControl('1234-567');
      const resultado = CepValidator.valido()(controle);
      expect(resultado).toEqual({ invalidCep: true });
    });

    it('deve retornar invalidCep para CEP com letras', () => {
      const controle = new FormControl('12345-abc');
      const resultado = CepValidator.valido()(controle);
      expect(resultado).toEqual({ invalidCep: true });
    });

    it('deve retornar invalidCep para formato inválido', () => {
      const controle = new FormControl('123456789');
      const resultado = CepValidator.valido()(controle);
      expect(resultado).toEqual({ invalidCep: true });
    });
  });

  describe('limparCep', () => {
    it('deve remover hífen do CEP', () => {
      const resultado = CepValidator.limparCep('12345-678');
      expect(resultado).toBe('12345678');
    });

    it('deve remover todos os caracteres não numéricos', () => {
      const resultado = CepValidator.limparCep('12.345-678');
      expect(resultado).toBe('12345678');
    });

    it('deve retornar apenas dígitos', () => {
      const resultado = CepValidator.limparCep('abc12345def678');
      expect(resultado).toBe('12345678');
    });
  });
});
