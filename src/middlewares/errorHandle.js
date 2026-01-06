import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  InternalServerError,
  createErrorFromPrisma,
  createErrorFromZod
} from '../utils/errors.js';

/**
 * Middleware global de tratamento de erros
 * Deve ser registrado APÓS todas as rotas
 */
export function errorHandler(err, req, res, next) {
  // Log estruturado do erro
  logger.error(`[${req.method} ${req.path}] Erro: ${err.message}`, {
    error: err.name,
    statusCode: err.statusCode || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // ═══════════════════════════════════════════════════════════════════════
  // ERROS CUSTOMIZADOS DA APLICAÇÃO
  // ═══════════════════════════════════════════════════════════════════════
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.statusCode, err.message, {
      details: err.details || err.field,
      resource: err.resource,
      originalError: process.env.NODE_ENV === 'development' ? err.originalError : undefined
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ERROS DE VALIDAÇÃO - ZOD
  // ═══════════════════════════════════════════════════════════════════════
  if (err.name === 'ZodError') {
    const issues = err.errors?.map(e => ({
      field: e.path?.join('.') || 'unknown',
      message: e.message,
      code: e.code
    })) || [];
    
    logger.warn(`Validação falhou em ${req.path}`, { issues });
    return ApiResponse.validationError(res, 'Validação falhou', { issues });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ERROS DE BANCO DE DADOS - PRISMA
  // ═══════════════════════════════════════════════════════════════════════
  if (err.code && err.code.startsWith('P')) {
    const prismaError = createErrorFromPrisma(err);
    logger.warn(`Erro Prisma [${err.code}] em ${req.path}`, { 
      meta: err.meta,
      originalError: err.message 
    });
    
    return ApiResponse.error(res, prismaError.statusCode, prismaError.message, {
      code: err.code,
      details: err.meta
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ERROS DE SINTAXE JSON
  // ═══════════════════════════════════════════════════════════════════════
  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn(`JSON inválido em ${req.path}`, { error: err.message });
    return ApiResponse.badRequest(res, 'JSON inválido no corpo da requisição');
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ERRO PADRÃO NÃO IDENTIFICADO
  // ═══════════════════════════════════════════════════════════════════════
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erro interno do servidor';

  return ApiResponse.error(res, statusCode, message, {
    error: err.name,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

