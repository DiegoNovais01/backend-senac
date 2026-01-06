// Constantes da aplicação
export const ROLES = {
  ADMIN: 'admin',
  PROFESSOR: 'professor',
  ALUNO: 'aluno',
  SECRETARIA: 'secretaria'
};

export const VALID_ROLES = Object.values(ROLES);

export const COURSE_LEVELS = {
  BASICO: 'basico',
  INTERMEDIARIO: 'intermediario',
  AVANCADO: 'avancado'
};

export const VALID_LEVELS = Object.values(COURSE_LEVELS);

export const COURSE_MODALITIES = {
  PRESENCIAL: 'presencial',
  ONLINE: 'online',
  HIBRIDO: 'hibrido'
};

export const VALID_MODALITIES = Object.values(COURSE_MODALITIES);

export const MATRICULA_STATUS = {
  ATIVA: 'ativa',
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada'
};

export const VALID_MATRICULA_STATUS = Object.values(MATRICULA_STATUS);

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

export const JWT_CONFIG = {
  EXPIRATION_TIME: '15m', // Token expira em 15 minutos
  REFRESH_EXPIRATION_TIME: '7d' // Refresh token expira em 7 dias
};

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 255,
  MIN_DESCRIPTION_LENGTH: 1,
  MAX_DESCRIPTION_LENGTH: 1000,
  CPF_LENGTH: 11,
  MIN_CARGA_HORARIA: 1,
  MAX_CARGA_HORARIA: 10000
};

export const API_LIMITS = {
  AUTH_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  AUTH_LIMIT_MAX_REQUESTS: 10,
  API_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  API_LIMIT_MAX_REQUESTS: 100,
  READ_LIMIT_MAX_REQUESTS: 300,
  WRITE_LIMIT_MAX_REQUESTS: 50
};
