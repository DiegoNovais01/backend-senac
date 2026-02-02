// Validadores de entrada comuns
import { ApiResponse, ERROR_MESSAGES } from './apiResponse.js';

export const validators = {
  // Validar ID
  validateId: (id) => {
    const parsedId = parseInt(id);
    if (isNaN(parsedId) || parsedId <= 0) {
      return { valid: false, error: ERROR_MESSAGES.INVALID_ID };
    }
    return { valid: true, value: parsedId };
  },

  // Validar email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
    }
    return { valid: true, value: email.toLowerCase() };
  },

  // Validar data (formato YYYY-MM-DD ou DD/MM/YYYY)
  validateDate: (date) => {
    if (!date) return { valid: true, value: null };

    let dateObj;

    if (typeof date === 'string') {
      // Tenta formato DD/MM/YYYY
      const dmy = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (dmy) {
        dateObj = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}`);
      } else {
        // Tenta formato YYYY-MM-DD
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }

    if (isNaN(dateObj.getTime())) {
      return { valid: false, error: ERROR_MESSAGES.INVALID_DATE };
    }

    return { valid: true, value: dateObj };
  },

  // Validar número positivo
  validatePositiveNumber: (value, fieldName = 'Valor') => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      return { valid: false, error: `${fieldName} deve ser um número positivo` };
    }
    return { valid: true, value: num };
  },

  // Validar string não-vazia
  validateString: (value, options = {}) => {
    const { min, max } = options;
    const fieldName = options.fieldName || 'Campo';
    const minLength = min || 1;
    const maxLength = max;

    if (!value || typeof value !== 'string') {
      return { valid: false, error: `${fieldName} é obrigatório` };
    }

    const trimmed = value.trim();

    if (trimmed.length < minLength) {
      return { valid: false, error: `${fieldName} deve ter no mínimo ${minLength} caracteres` };
    }

    if (maxLength && trimmed.length > maxLength) {
      return { valid: false, error: `${fieldName} deve ter no máximo ${maxLength} caracteres` };
    }

    return { valid: true, value: trimmed };
  },

  // Validar que é um dos valores permitidos
  validateEnum: (value, allowedValues, fieldName = 'Campo') => {
    if (!allowedValues.includes(value)) {
      return {
        valid: false,
        error: `${fieldName} deve ser um dos seguintes: ${allowedValues.join(', ')}`
      };
    }
    return { valid: true, value };
  },

  // Validar inteiro
  validateInt: (value, options = {}) => {
    const { min, max } = options;
    const num = parseInt(value);

    if (isNaN(num)) {
      return { valid: false, error: 'Valor deve ser um número inteiro' };
    }

    // Verifica se é realmente um inteiro (não float)
    if (parseFloat(value) !== num) {
      return { valid: false, error: 'Valor deve ser um número inteiro' };
    }

    if (min !== undefined && num < min) {
      return { valid: false, error: `Valor deve ser no mínimo ${min}` };
    }

    if (max !== undefined && num > max) {
      return { valid: false, error: `Valor deve ser no máximo ${max}` };
    }

    return { valid: true, value: num };
  },

  // Validar CPF
  validateCPF: (cpf) => {
    if (!cpf) return { valid: false, error: 'CPF é obrigatório' };

    // Remove caracteres não numéricos
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) {
      return { valid: false, error: 'CPF deve ter 11 dígitos' };
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleaned)) {
      return { valid: false, error: 'CPF inválido' };
    }

    // Calcula dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cleaned[9])) {
      return { valid: false, error: 'CPF inválido' };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cleaned[10])) {
      return { valid: false, error: 'CPF inválido' };
    }

    return { valid: true, value: cleaned };
  },

  // Validar float
  validateFloat: (value, options = {}) => {
    const { min, max } = options;
    const num = parseFloat(value);

    if (isNaN(num)) {
      return { valid: false, error: 'Valor deve ser um número' };
    }

    if (min !== undefined && num < min) {
      return { valid: false, error: `Valor deve ser no mínimo ${min}` };
    }

    if (max !== undefined && num > max) {
      return { valid: false, error: `Valor deve ser no máximo ${max}` };
    }

    return { valid: true, value: num };
  },
};

// Middleware para validar query parameters
export const validateQueryParams = (allowedParams = []) => {
  return (req, res, next) => {
    const invalidParams = Object.keys(req.query).filter(
      param => !allowedParams.includes(param)
    );

    if (invalidParams.length > 0) {
      return ApiResponse.badRequest(
        res,
        `Parâmetros inválidos: ${invalidParams.join(', ')}. Parâmetros válidos: ${allowedParams.join(', ')}`
      );
    }

    next();
  };
};

// Middleware para validar que o corpo da requisição não está vazio
export const validateBodyNotEmpty = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return ApiResponse.badRequest(res, 'Corpo da requisição não pode estar vazio');
  }
  next();
};
