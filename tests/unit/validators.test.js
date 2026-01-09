import { validateId, validateEmail, validateString, validateInt, validateCPF } from '../../src/utils/validators.js';

describe('Validators Utils', () => {
  describe('validateId', () => {
    test('deve aceitar ID válido', () => {
      const result = validateId(5);
      expect(result.valid).toBe(true);
      expect(result.data).toBe(5);
    });

    test('deve rejeitar ID inválido (string)', () => {
      const result = validateId('abc');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('deve rejeitar ID negativo', () => {
      const result = validateId(-1);
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar ID zero', () => {
      const result = validateId(0);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateEmail', () => {
    test('deve aceitar email válido', () => {
      const result = validateEmail('user@example.com');
      expect(result.valid).toBe(true);
      expect(result.data).toBe('user@example.com');
    });

    test('deve rejeitar email sem @', () => {
      const result = validateEmail('userexample.com');
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar email vazio', () => {
      const result = validateEmail('');
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar email sem domínio', () => {
      const result = validateEmail('user@');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateString', () => {
    test('deve aceitar string válida', () => {
      const result = validateString('Hello World', { min: 5, max: 20 });
      expect(result.valid).toBe(true);
    });

    test('deve rejeitar string muito curta', () => {
      const result = validateString('Hi', { min: 5 });
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar string muito longa', () => {
      const result = validateString('a'.repeat(101), { max: 100 });
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar string nula', () => {
      const result = validateString(null);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateInt', () => {
    test('deve aceitar inteiro válido', () => {
      const result = validateInt(5, { min: 0, max: 10 });
      expect(result.valid).toBe(true);
      expect(result.data).toBe(5);
    });

    test('deve rejeitar inteiro fora do range', () => {
      const result = validateInt(15, { min: 0, max: 10 });
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar float quando espera int', () => {
      const result = validateInt(5.5);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateCPF', () => {
    test('deve aceitar CPF válido (formatado)', () => {
      const result = validateCPF('123.456.789-00');
      expect(result.valid).toBe(true);
    });

    test('deve aceitar CPF válido (sem formatação)', () => {
      const result = validateCPF('12345678900');
      expect(result.valid).toBe(true);
    });

    test('deve rejeitar CPF com dígitos repetidos', () => {
      const result = validateCPF('111.111.111-11');
      expect(result.valid).toBe(false);
    });

    test('deve rejeitar CPF muito curto', () => {
      const result = validateCPF('123');
      expect(result.valid).toBe(false);
    });
  });
});
