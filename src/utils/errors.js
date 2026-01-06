/**
 * Classes de erro personalizadas para melhor tratamento
 * Permite criar erros typed e capturá-los de forma mais específica
 */

/**
 * Erro base para toda a aplicação
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro de validação - 400
 */
export class ValidationError extends AppError {
  constructor(message = 'Dados inválidos', details = {}) {
    super(message, 400);
    this.details = details;
  }
}

/**
 * Erro de autenticação - 401
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Não autenticado') {
    super(message, 401);
  }
}

/**
 * Erro de autorização - 403
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 403);
  }
}

/**
 * Erro de recurso não encontrado - 404
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso não encontrado', resource = 'Recurso') {
    super(message, 404);
    this.resource = resource;
  }
}

/**
 * Erro de conflito - 409
 * Usado quando tenta criar um recurso que já existe (ex: CPF duplicado)
 */
export class ConflictError extends AppError {
  constructor(message = 'Recurso já existe', field = null) {
    super(message, 409);
    this.field = field;
  }
}

/**
 * Erro de entidade não processável - 422
 * Usado para validações mais complexas
 */
export class UnprocessableEntityError extends AppError {
  constructor(message = 'Não foi possível processar a solicitação', details = {}) {
    super(message, 422);
    this.details = details;
  }
}

/**
 * Erro de requisição ruim - 400
 */
export class BadRequestError extends AppError {
  constructor(message = 'Requisição inválida') {
    super(message, 400);
  }
}

/**
 * Erro de servidor interno - 500
 */
export class InternalServerError extends AppError {
  constructor(message = 'Erro interno do servidor', originalError = null) {
    super(message, 500);
    this.originalError = originalError;
  }
}

/**
 * Erro de recurso não disponível - 503
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Serviço indisponível') {
    super(message, 503);
  }
}

/**
 * Erro de limite de requisições excedido - 429
 */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Muitas requisições. Tente novamente mais tarde.', retryAfter = 60) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Validador de erro - identifica o tipo de erro e retorna a classe apropriada
 */
export const createErrorFromPrisma = (error) => {
  const code = error.code;
  
  switch (code) {
    case 'P2002': // Unique constraint failed
      return new ConflictError(
        `${error.meta?.target?.[0] || 'Campo'} já existe`,
        error.meta?.target?.[0]
      );
    
    case 'P2025': // Record not found
      return new NotFoundError(
        'Registro não encontrado',
        error.meta?.modelName || 'Recurso'
      );
    
    case 'P2003': // Foreign key constraint failed
      return new BadRequestError(
        `Referência inválida para ${error.meta?.relationName || 'outro recurso'}`
      );
    
    case 'P2014': // Required relation violation
      return new BadRequestError(
        `Não pode deletar este registro pois está vinculado a outros registros`
      );
    
    case 'P2000': // Value too long for column
      return new ValidationError('Um dos valores é muito longo');
    
    case 'P2001': // The record to delete does not exist
      return new NotFoundError('Registro a deletar não encontrado');
    
    default:
      return new InternalServerError(`Erro de banco de dados: ${error.message}`, error);
  }
};

/**
 * Validador de erro Zod
 */
export const createErrorFromZod = (error) => {
  const issues = error.issues.map(issue => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code
  }));
  
  return new ValidationError('Validação falhou', { issues });
};
