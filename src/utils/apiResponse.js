// Utilitário para respostas padronizadas
import { logger } from './logger.js';

const ERROR_MESSAGES = {
  // Validação
  INVALID_ID: 'ID inválido - deve ser um número inteiro positivo',
  INVALID_CPF: 'CPF inválido. Deve conter 11 dígitos válidos (exemplo: 123.456.789-10)',
  INVALID_EMAIL: 'Email inválido',
  INVALID_DATE: 'Data inválida. Use o formato YYYY-MM-DD',
  INVALID_DATA: 'Dados fornecidos inválidos',

  // Duplicação
  CPF_DUPLICATED: 'CPF já cadastrado em outro registro',
  EMAIL_DUPLICATED: 'Email já cadastrado',
  DUPLICATE_FIELD: 'Este valor já existe no banco de dados',

  // Não encontrado
  NOT_FOUND: 'Recurso não encontrado',
  ALUNO_NOT_FOUND: 'Aluno não encontrado',
  CURSO_NOT_FOUND: 'Curso não encontrado',
  INSTRUTOR_NOT_FOUND: 'Instrutor não encontrado',
  MATRICULA_NOT_FOUND: 'Matrícula não encontrada',
  AVALIACAO_NOT_FOUND: 'Avaliação não encontrada',
  CATEGORIA_NOT_FOUND: 'Categoria não encontrada',
  USUARIO_NOT_FOUND: 'Usuário não encontrado',

  // Operações específicas
  MATRICULA_NOT_IN_COURSE: 'Aluno não está matriculado neste curso',
  CATEGORIA_WITH_COURSES: 'Não é possível deletar categoria com cursos associados',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  UNAUTHORIZED: 'Não autorizado. Token inválido ou expirado',
  FORBIDDEN: 'Acesso negado. Você não tem permissão para esta ação',

  // Servidor
  DATABASE_ERROR: 'Erro na operação com banco de dados',
  SERVER_ERROR: 'Erro interno do servidor',
  VALIDATION_ERROR: 'Erro de validação nos dados fornecidos'
};

export const ApiResponse = {
  // Sucesso
  success: (res, data, statusCode = 200, message = null) => {
    logger.info(`API Response: ${statusCode}`, { message, dataType: typeof data });
    return res.status(statusCode).json({
      success: true,
      ...(message && { message }),
      data
    });
  },

  created: (res, data, message = 'Recurso criado com sucesso') => {
    return ApiResponse.success(res, data, 201, message);
  },

  // Erros de validação
  badRequest: (res, message = ERROR_MESSAGES.INVALID_DATA, details = null) => {
    logger.warn(`Bad Request: ${message}`, details);
    return res.status(400).json({
      success: false,
      error: message,
      ...(details && { details })
    });
  },

  // Não encontrado
  notFound: (res, message = ERROR_MESSAGES.NOT_FOUND) => {
    logger.warn(`Not Found: ${message}`);
    return res.status(404).json({
      success: false,
      error: message
    });
  },

  // Não autorizado
  unauthorized: (res, message = ERROR_MESSAGES.UNAUTHORIZED) => {
    logger.warn(`Unauthorized: ${message}`);
    return res.status(401).json({
      success: false,
      error: message
    });
  },

  // Acesso negado
  forbidden: (res, message = ERROR_MESSAGES.FORBIDDEN) => {
    logger.warn(`Forbidden: ${message}`);
    return res.status(403).json({
      success: false,
      error: message
    });
  },

  // Erro genérico do servidor
  serverError: (res, message = ERROR_MESSAGES.SERVER_ERROR, error = null) => {
    logger.error(`Server Error: ${message}`, error);
    return res.status(500).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && error && { details: error.message })
    });
  },

  // Erro de validação específico
  validationError: (res, message = ERROR_MESSAGES.VALIDATION_ERROR, details = null) => {
    logger.warn(`Validation Error: ${message}`, details);
    return res.status(400).json({
      success: false,
      error: message,
      ...(details && { details })
    });
  },

  // Erro de banco de dados
  dbError: (res, error, operation = 'operação no banco de dados') => {
    logger.logDbError(operation, error);

    // Mensagens específicas por código de erro Prisma
    const errorMap = {
      'P2002': `${error.meta?.target?.[0] || 'Campo'} já está em uso`,
      'P2025': 'Registro não encontrado no banco de dados',
      'P2003': 'Referência inválida - registro relacionado não existe',
      'P2014': 'Operação falhou - há registros relacionados que precisam ser removidos primeiro'
    };

    const message = errorMap[error.code] || ERROR_MESSAGES.DATABASE_ERROR;

    return res.status(400).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { code: error.code })
    });
  }
};

export { ERROR_MESSAGES };
