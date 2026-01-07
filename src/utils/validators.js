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
  validateString: (value, fieldName = 'Campo', minLength = 1, maxLength = null) => {
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

  // Validar que é um objeto com campos
  validateObject: (obj, requiredFields = []) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return { valid: false, error: 'Dados inválidos - esperado um objeto' };
    }

    const missingFields = requiredFields.filter(field => !obj[field]);
    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `Campos obrigatórios faltando: ${missingFields.join(', ')}`
      };
    }

    return { valid: true };
  }
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
