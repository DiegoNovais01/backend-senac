// Middleware centralizado de validação
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware para validar que body não está vazio e é um objeto válido
 */
export const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    logger.warn(`Body vazio em ${req.method} ${req.path}`);
    return ApiResponse.badRequest(res, 'Corpo da requisição não pode estar vazio');
  }

  if (typeof req.body !== 'object' || Array.isArray(req.body)) {
    logger.warn(`Body inválido em ${req.method} ${req.path}`);
    return ApiResponse.badRequest(res, 'Corpo da requisição deve ser um objeto JSON válido');
  }

  next();
};

/**
 * Middleware para validar parâmetro ID
 */
export const validateIdParam = (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    logger.warn(`ID faltando em ${req.method} ${req.path}`);
    return ApiResponse.badRequest(res, 'ID é obrigatório');
  }

  const parsedId = parseInt(id);
  if (isNaN(parsedId) || parsedId <= 0) {
    logger.warn(`ID inválido em ${req.method} ${req.path}: ${id}`);
    return ApiResponse.badRequest(res, 'ID inválido - deve ser um número inteiro positivo');
  }

  // Armazenar ID validado na requisição para usar no controller
  req.validatedId = parsedId;
  next();
};

/**
 * Middleware para sanitizar inputs (remover espaços extras)
 */
export const sanitizeInputs = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitize(req.body);
  }

  next();
};

/**
 * Middleware para converter valores booleanos de strings para boolean
 */
export const parseBooleanValues = (req, res, next) => {
  const parseBoolean = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        if (obj[key].toLowerCase() === 'true') obj[key] = true;
        if (obj[key].toLowerCase() === 'false') obj[key] = false;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        parseBoolean(obj[key]);
      }
    }
  };

  if (req.body) {
    parseBoolean(req.body);
  }

  if (req.query) {
    parseBoolean(req.query);
  }

  next();
};

/**
 * Middleware para converter valores numéricos de strings para numbers
 * Use com cuidado para não quebrar validações de CPF e similares
 */
export const parseNumberValues = (fields = []) => {
  return (req, res, next) => {
    if (req.body) {
      fields.forEach(field => {
        if (field in req.body && req.body[field] !== null && req.body[field] !== '') {
          const num = parseFloat(req.body[field]);
          if (!isNaN(num)) {
            req.body[field] = num;
          }
        }
      });
    }
    next();
  };
};

/**
 * Middleware para remover campos sensíveis antes de retornar
 */
export const removeSensitiveFields = (fields = []) => {
  return (req, res, next) => {
    // Interceptar a resposta
    const originalJson = res.json;

    res.json = function (data) {
      if (data && typeof data === 'object') {
        const removeFields = (obj) => {
          if (Array.isArray(obj)) {
            obj.forEach(item => removeFields(item));
          } else if (typeof obj === 'object' && obj !== null) {
            fields.forEach(field => {
              delete obj[field];
            });
            // Recursivamente remover de nested objects
            Object.values(obj).forEach(value => {
              if (typeof value === 'object' && value !== null) {
                removeFields(value);
              }
            });
          }
        };

        removeFields(data);
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Middleware para limitar o tamanho do payload
 */
export const limitPayloadSize = (maxSize = '1mb') => {
  // O express.json() já faz isso, mas pode ser configurado aqui também
  return (req, res, next) => {
    const size = JSON.stringify(req.body).length;
    const maxBytes = maxSize.toLowerCase().includes('kb')
      ? parseInt(maxSize) * 1024
      : parseInt(maxSize) * 1024 * 1024;

    if (size > maxBytes) {
      logger.warn(`Payload muito grande: ${size} bytes no ${req.method} ${req.path}`);
      return res.status(413).json({
        success: false,
        error: `Payload é muito grande. Máximo permitido: ${maxSize}`
      });
    }

    next();
  };
};

/**
 * Compor múltiplos middlewares de validação
 */
export const composeValidators = (...validators) => {
  return (req, res, next) => {
    let index = 0;

    const executeNext = (err) => {
      if (err) return next(err);
      if (index >= validators.length) return next();

      validators[index++](req, res, executeNext);
    };

    executeNext();
  };
};
