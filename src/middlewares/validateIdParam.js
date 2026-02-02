import { ApiResponse } from '../utils/apiResponse.js';
import { validators } from '../utils/validators.js';

/**
 * Middleware centralizado para validação de ID em parâmetros de rota
 * Valida que o ID é um número inteiro válido
 * 
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 * @returns {void} - Chama next() se válido, retorna erro se inválido
 */
export const validateIdParam = (req, res, next) => {
  const id = req.params.id;

  // Validar usando o validador centralizado
  const validation = validators.validateId(id);
  if (!validation.valid) {
    return ApiResponse.badRequest(res, validation.error || 'ID inválido - deve ser um número inteiro positivo');
  }

  // Se passou na validação, prosseguir
  next();
};
