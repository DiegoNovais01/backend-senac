import { validators } from '../../src/utils/validators.js';

describe('Validators Utils', () => {
  describe('validateId', () => {
    test('deve aceitar ID válido', () => {
      const result = validators.validateId(5);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(5);
    });

    test('deve rejeitar ID inválido (string)', () => {
      const result = validators.validateId('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('deve rejeitar ID negativo', () => {
      const result = validators.validateId(-1);
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar ID zero', () => {
      const result = validators.validateId(0);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('deve aceitar email válido', () => {
      const result = validators.validateEmail('user@example.com');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('user@example.com');
    });

    test('deve rejeitar email sem @', () => {
      const result = validators.validateEmail('userexample.com');
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar email vazio', () => {
      const result = validators.validateEmail('');
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar email sem domínio', () => {
      const result = validators.validateEmail('user@');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateString', () => {
    test('deve aceitar string válida', () => {
      const result = validators.validateString('Hello World', { min: 5, max: 20 });
      expect(result.valid).toBe(true);
    });

    test('deve rejeitar string muito curta', () => {
      const result = validators.validateString('Hi', { min: 5 });
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar string muito longa', () => {
      const result = validators.validateString('a'.repeat(101), { max: 100 });
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar string nula', () => {
      const result = validators.validateString(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateInt', () => {
    test('deve aceitar inteiro válido', () => {
      const result = validators.validateInt(5, { min: 0, max: 10 });
      expect(result.valid).toBe(true);
      expect(result.value).toBe(5);
    });

    test('deve rejeitar inteiro fora do range', () => {
      const result = validators.validateInt(15, { min: 0, max: 10 });
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar float quando espera int', () => {
      const result = validators.validateInt(5.5);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCPF', () => {
    test('deve aceitar CPF válido (formatado)', () => {
      const result = validators.validateCPF('529.982.247-25');
      expect(result.valid).toBe(true);
    });

    test('deve aceitar CPF válido (sem formatação)', () => {
      const result = validators.validateCPF('52998224725');
      expect(result.valid).toBe(true);
    });

    test('deve rejeitar CPF com dígitos repetidos', () => {
      const result = validators.validateCPF('111.111.111-11');
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar CPF muito curto', () => {
      const result = validators.validateCPF('123');
      expect(result.valid).toBe(false);
    });
  });
});
