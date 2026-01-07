/**
 * GUIA DE USO DOS NOVOS UTILITÁRIOS E MIDDLEWARES
 * 
 * Este arquivo mostra exemplos práticos de como usar os novos
 * utilitários criados para melhorar a qualidade do código.
 */

// ═════════════════════════════════════════════════════════════════════════════
// 1. IMPORTANDO OS UTILITÁRIOS
// ═════════════════════════════════════════════════════════════════════════════

// Opção A: Importar do índice centralizado (RECOMENDADO)
import {
  logger,                    // Logging estruturado
  ApiResponse,              // Handler de respostas padronizado
  validators,               // Funções de validação
  validarCPF,              // Validar CPF
  normalizarCPF,           // Normalizar CPF
  getPagination,           // Paginação
  ROLES,                   // Constantes de roles
  COURSE_LEVELS,           // Constantes de níveis
  HTTP_STATUS,             // Códigos HTTP
} from '../utils/index.js';

// Opção B: Importar especificamente (para quando precisa de poucos)
import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';

// ═════════════════════════════════════════════════════════════════════════════
// 2. LOGGER - LOGGING ESTRUTURADO
// ═════════════════════════════════════════════════════════════════════════════

// INFO - Operações normais completadas com sucesso
logger.info('Aluno criado com sucesso', { alunoId: 123, email: 'joao@email.com' });

// WARN - Situações anormais mas não são erros
logger.warn('Login falhou por terceira vez', { userId: 456, ip: '192.168.1.1' });

// ERROR - Erros que devem ser investigados
logger.error('Falha ao conectar ao banco', { error: err.message, database: 'mysql' });

// DEBUG - Informações detalhadas (apenas em development)
logger.debug('Parâmetros da requisição', { query: req.query, body: req.body });

// ═════════════════════════════════════════════════════════════════════════════
// 3. API RESPONSE - RESPOSTAS PADRONIZADAS
// ═════════════════════════════════════════════════════════════════════════════

// Sucesso - retorna dados
export const example_success = async (req, res) => {
  const dados = { id: 1, nome: 'João' };
  return ApiResponse.success(res, 'Aluno encontrado', dados);
};

// Criado - novo recurso criado
export const example_created = async (req, res) => {
  const novoAluno = { id: 2, nome: 'Maria', email: 'maria@email.com' };
  return ApiResponse.created(res, 'Aluno criado com sucesso', novoAluno);
};

// Bad Request - dados inválidos
export const example_badRequest = async (req, res) => {
  return ApiResponse.badRequest(res, 'Email é obrigatório');
};

// Validation Error - erros de validação detalhados
export const example_validationError = async (req, res) => {
  const errors = {
    issues: [
      { field: 'cpf', message: 'CPF inválido' },
      { field: 'email', message: 'Email inválido' }
    ]
  };
  return ApiResponse.validationError(res, 'Validação falhou', errors);
};

// Not Found - recurso não existe
export const example_notFound = async (req, res) => {
  return ApiResponse.notFound(res, 'Aluno não encontrado');
};

// Conflict - recurso duplicado
export const example_conflict = async (req, res) => {
  return ApiResponse.conflict(res, 'CPF já existe', { field: 'cpf' });
};

// Unauthorized - não autenticado
export const example_unauthorized = async (req, res) => {
  return ApiResponse.unauthorized(res, 'Token inválido ou expirado');
};

// Forbidden - sem permissão
export const example_forbidden = async (req, res) => {
  return ApiResponse.forbidden(res, 'Você não tem permissão para esta ação');
};

// Server Error - erro no servidor
export const example_serverError = async (req, res) => {
  return ApiResponse.serverError(res, 'Erro ao processar requisição', { requestId: req.id });
};

// ═════════════════════════════════════════════════════════════════════════════
// 4. VALIDATORS - VALIDAÇÕES COMUNS
// ═════════════════════════════════════════════════════════════════════════════

// Validar ID (deve ser número positivo)
export const example_validateId = (req, res) => {
  try {
    const id = validators.validateId(req.params.id);
    return ApiResponse.success(res, 'ID válido', { id });
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
};

// Validar Email
export const example_validateEmail = (req, res) => {
  try {
    const email = validators.validateEmail(req.body.email);
    return ApiResponse.success(res, 'Email válido', { email });
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
};

// Validar Data (DD/MM/YYYY ou YYYY-MM-DD)
export const example_validateDate = (req, res) => {
  try {
    const data = validators.validateDate(req.body.dataNascimento);
    return ApiResponse.success(res, 'Data válida', { data });
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
};

// Validar String com min/max length
export const example_validateString = (req, res) => {
  try {
    const nome = validators.validateString(req.body.nome, 3, 100);
    return ApiResponse.success(res, 'String válida', { nome });
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
};

// Validar Number
export const example_validateNumber = (req, res) => {
  try {
    const nota = validators.validatePositiveNumber(req.body.nota);
    return ApiResponse.success(res, 'Número válido', { nota });
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
};

// Validar Enum (ex: status deve ser um dos valores permitidos)
export const example_validateEnum = (req, res) => {
  try {
    const status = validators.validateEnum(
      req.body.status,
      ['ativa', 'concluida', 'cancelada'],
      'Status inválido'
    );
    return ApiResponse.success(res, 'Enum válido', { status });
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// 5. CPF - VALIDAÇÃO E FORMATAÇÃO
// ═════════════════════════════════════════════════════════════════════════════

// Validar CPF (com algoritmo)
export const example_validarCPF = (req, res) => {
  if (!validarCPF(req.body.cpf)) {
    return ApiResponse.badRequest(res, 'CPF inválido');
  }
  return ApiResponse.success(res, 'CPF válido');
};

// Normalizar CPF (remove caracteres especiais)
export const example_normalizarCPF = (req, res) => {
  const cpfNormalizado = normalizarCPF(req.body.cpf);
  // 123.456.789-00 vira 12345678900
  return ApiResponse.success(res, 'CPF normalizado', { cpf: cpfNormalizado });
};

// ═════════════════════════════════════════════════════════════════════════════
// 6. CONSTANTES - USAR EM VEZ DE MAGIC STRINGS
// ═════════════════════════════════════════════════════════════════════════════

// Ao invés disso:
const roles_bad = ['admin', 'professor', 'aluno', 'secretaria'];

// Fazer isso:
const roles_good = Object.values(ROLES);  // ['admin', 'professor', 'aluno', 'secretaria']

// Validar role
if (user.role === ROLES.ADMIN) {
  // usuário é admin
}

// Validar nível de curso
if (curso.nivel === COURSE_LEVELS.BASICO) {
  // curso é básico
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. PAGINAÇÃO - REQUISIÇÕES COM MUITOS DADOS
// ═════════════════════════════════════════════════════════════════════════════

export const example_pagination = async (req, res) => {
  try {
    // Extrair page e limit da query
    const { page = 1, limit = 10 } = req.query;

    // Validar e calcular offset
    const { skip, take } = getPagination(page, limit);

    // Usar no banco de dados
    const total = await prisma.aluno.count();
    const alunos = await prisma.aluno.findMany({
      skip,
      take,
      orderBy: { id: 'desc' }
    });

    // Retornar com meta de paginação
    return ApiResponse.success(res, 'Alunos listados', {
      alunos,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNextPage: skip + take < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    logger.error('Erro ao listar alunos', { error: error.message });
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// 8. CLASSES DE ERRO - TRATAMENTO ESTRUTURADO
// ═════════════════════════════════════════════════════════════════════════════

import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
  AppError
} from '../utils/errors.js';

export const example_errors = async (req, res, next) => {
  try {
    // Validação falhou - status 400
    if (!req.body.email) {
      throw new ValidationError('Email é obrigatório', { field: 'email' });
    }

    // Recurso não existe - status 404
    const aluno = await prisma.aluno.findUnique({
      where: { id: req.params.id }
    });
    if (!aluno) {
      throw new NotFoundError('Aluno não encontrado', 'Aluno');
    }

    // Conflito - status 409
    const alunoExistente = await prisma.aluno.findUnique({
      where: { cpf: req.body.cpf }
    });
    if (alunoExistente) {
      throw new ConflictError('CPF já existe', 'cpf');
    }

    // Sem permissão - status 403
    if (req.user.role !== ROLES.ADMIN) {
      throw new AuthorizationError('Apenas admins podem fazer isso');
    }

  } catch (error) {
    // Erros customizados são capturados pelo errorHandler middleware
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// 9. EXEMPLO COMPLETO - CRIAR ALUNO
// ═════════════════════════════════════════════════════════════════════════════

export const criarAlunoCompleto = async (req, res, next) => {
  try {
    // 1. LOG - início da operação
    logger.info('Iniciando criação de aluno', { body: req.body });

    // 2. VALIDAÇÃO - todos os campos obrigatórios
    const { nome, email, cpf } = req.body;

    // Usar validators
    try {
      validators.validateString(nome, 3, 100);
      validators.validateEmail(email);
    } catch (error) {
      logger.warn(`Validação falhou: ${error.message}`);
      return ApiResponse.validationError(res, 'Dados inválidos', { error: error.message });
    }

    // 3. VALIDAÇÃO - CPF
    if (!validarCPF(cpf)) {
      logger.warn(`CPF inválido: ${cpf}`);
      return ApiResponse.badRequest(res, 'CPF inválido');
    }

    // 4. VERIFICAR DUPLICATA
    const alunoExistente = await prisma.aluno.findUnique({
      where: { cpf: normalizarCPF(cpf) }
    });

    if (alunoExistente) {
      logger.warn(`Tentativa de criar aluno com CPF duplicado: ${cpf}`);
      return ApiResponse.conflict(res, 'CPF já existe', { field: 'cpf' });
    }

    // 5. CRIAR no banco
    const novoAluno = await prisma.aluno.create({
      data: {
        nome,
        email,
        cpf: normalizarCPF(cpf)
      }
    });

    // 6. LOG - sucesso
    logger.info(`Aluno criado com sucesso`, { alunoId: novoAluno.id, email });

    // 7. RESPOSTA - sucesso
    return ApiResponse.created(res, 'Aluno criado com sucesso', novoAluno);

  } catch (error) {
    // 8. LOG - erro
    logger.error(`Erro ao criar aluno: ${error.message}`);

    // 9. PASSAR para errorHandler
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// 10. CHECKLIST - ANTES DE FAZER PR
// ═════════════════════════════════════════════════════════════════════════════

/*
✅ Meu controller usa os novos utilitários?
  [ ] Importando do utils/index.js
  [ ] Usando logger para logging
  [ ] Usando ApiResponse para respostas
  [ ] Usando validators para validação
  [ ] Usando constantes ao invés de magic strings
  [ ] Usando classes de erro customizadas

✅ Meu código é seguro?
  [ ] Validando todos os inputs
  [ ] Checando autenticação (token)
  [ ] Checando autorização (role)
  [ ] Não retornando dados sensíveis
  [ ] Usando Prisma (protegido contra SQL injection)

✅ Meu código é rastreável?
  [ ] Logger.info para operações
  [ ] Logger.warn para avisos
  [ ] Logger.error para erros
  [ ] Não logando dados sensíveis (senhas, tokens)

✅ Meu código é testável?
  [ ] Funções puras quando possível
  [ ] Erros bem definidos
  [ ] Respostas padronizadas
  [ ] Dependências injetáveis (se possível)
*/
