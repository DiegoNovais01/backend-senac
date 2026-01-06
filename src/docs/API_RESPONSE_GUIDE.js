/**
 * GUIA DE PADRÃO DE RESPOSTA - API SENAC
 * 
 * Este arquivo documenta como TODA resposta da API deve ser formatada.
 * Todas as rotas DEVEM seguir este padrão para consistência.
 */

// ═════════════════════════════════════════════════════════════════════════════
// FORMATO PADRÃO DE RESPOSTA
// ═════════════════════════════════════════════════════════════════════════════

/**
 * SUCESSO (200, 201, 204)
 * 
 * Formato:
 * {
 *   success: true,
 *   status: 200,
 *   message: "Descrição amigável do que aconteceu",
 *   data: { ... dados da resposta ... }
 * }
 */
export const RESPONSE_SUCCESS_EXAMPLE = {
  success: true,
  status: 200,
  message: "Alunos listados com sucesso",
  data: [
    { id: 1, nome: "João", cpf: "123.456.789-00" },
    { id: 2, nome: "Maria", cpf: "987.654.321-00" }
  ]
};

/**
 * CRIADO (201)
 * 
 * Formato:
 * {
 *   success: true,
 *   status: 201,
 *   message: "Recurso criado com sucesso",
 *   data: { ... dados do novo recurso ... }
 * }
 */
export const RESPONSE_CREATED_EXAMPLE = {
  success: true,
  status: 201,
  message: "Aluno criado com sucesso",
  data: {
    id: 3,
    nome: "Pedro",
    cpf: "111.222.333-44",
    email: "pedro@example.com"
  }
};

/**
 * ERRO (4xx, 5xx)
 * 
 * Formato:
 * {
 *   success: false,
 *   status: 400,
 *   error: "BadRequest" ou "ValidationError" ou "NotFound",
 *   message: "Descrição amigável do erro",
 *   details: { ... informações adicionais sobre o erro ... }
 * }
 */
export const RESPONSE_ERROR_EXAMPLE = {
  success: false,
  status: 400,
  error: "ValidationError",
  message: "Validação falhou",
  details: {
    issues: [
      {
        field: "cpf",
        message: "CPF inválido",
        code: "invalid_format"
      },
      {
        field: "email",
        message: "Email inválido",
        code: "invalid_email"
      }
    ]
  }
};

/**
 * ERRO 404 (Não encontrado)
 */
export const RESPONSE_NOT_FOUND_EXAMPLE = {
  success: false,
  status: 404,
  error: "NotFound",
  message: "Aluno não encontrado",
  details: {
    resource: "Aluno",
    id: 999
  }
};

/**
 * ERRO 409 (Conflito - recurso duplicado)
 */
export const RESPONSE_CONFLICT_EXAMPLE = {
  success: false,
  status: 409,
  error: "ConflictError",
  message: "CPF já está em uso",
  details: {
    field: "cpf",
    value: "123.456.789-00"
  }
};

/**
 * ERRO 401 (Não autenticado)
 */
export const RESPONSE_UNAUTHORIZED_EXAMPLE = {
  success: false,
  status: 401,
  error: "AuthenticationError",
  message: "Token inválido ou expirado",
  details: {
    timestamp: "2024-01-15T10:30:00.000Z"
  }
};

/**
 * ERRO 403 (Sem permissão)
 */
export const RESPONSE_FORBIDDEN_EXAMPLE = {
  success: false,
  status: 403,
  error: "AuthorizationError",
  message: "Você não tem permissão para executar esta ação",
  details: {
    requiredRole: "admin",
    currentRole: "aluno"
  }
};

/**
 * ERRO 500 (Erro interno do servidor)
 */
export const RESPONSE_INTERNAL_ERROR_EXAMPLE = {
  success: false,
  status: 500,
  error: "InternalServerError",
  message: "Erro interno do servidor",
  details: {
    requestId: "1705318200000-a1b2c3d4e5",
    timestamp: "2024-01-15T10:30:00.000Z",
    contactSupport: true
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// IMPLEMENTAÇÃO PRÁTICA NOS CONTROLLERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * EXEMPLO CORRETO DE UM CONTROLLER:
 * 
 * import { ApiResponse } from '../utils/apiResponse.js';
 * import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';
 * import { logger } from '../utils/logger.js';
 * 
 * export const criarAluno = async (req, res, next) => {
 *   try {
 *     const { nome, email, cpf } = req.body;
 *     
 *     // 1. VALIDAR
 *     if (!nome || !email || !cpf) {
 *       logger.warn(`Criação de aluno com dados incompletos`);
 *       return ApiResponse.badRequest(res, 'Nome, email e CPF são obrigatórios');
 *     }
 *     
 *     // 2. VALIDAR CPF
 *     if (!validarCPF(cpf)) {
 *       logger.warn(`CPF inválido: ${cpf}`);
 *       return ApiResponse.validationError(res, 'CPF inválido', { field: 'cpf' });
 *     }
 *     
 *     // 3. VERIFICAR DUPLICATAS
 *     const alunoExistente = await prisma.aluno.findUnique({
 *       where: { cpf: normalizarCPF(cpf) }
 *     });
 *     
 *     if (alunoExistente) {
 *       logger.warn(`Tentativa de criar aluno com CPF duplicado: ${cpf}`);
 *       return ApiResponse.conflict(res, 'CPF já está em uso', { field: 'cpf' });
 *     }
 *     
 *     // 4. CRIAR
 *     const novoAluno = await prisma.aluno.create({
 *       data: {
 *         nome,
 *         email,
 *         cpf: normalizarCPF(cpf)
 *       }
 *     });
 *     
 *     logger.info(`Aluno criado com sucesso: ${novoAluno.id}`);
 *     
 *     // 5. RETORNAR SUCESSO
 *     return ApiResponse.created(res, 'Aluno criado com sucesso', novoAluno);
 *     
 *   } catch (error) {
 *     logger.error(`Erro ao criar aluno: ${error.message}`);
 *     next(error); // Passa para o middleware de erro
 *   }
 * };
 */

// ═════════════════════════════════════════════════════════════════════════════
// MÉTODOS DISPONÍVEIS NO ApiResponse
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ApiResponse.success(res, message, data, statusCode = 200)
 * ApiResponse.created(res, message, data)
 * ApiResponse.noContent(res)
 * ApiResponse.badRequest(res, message, details = {})
 * ApiResponse.unauthorized(res, message, details = {})
 * ApiResponse.forbidden(res, message, details = {})
 * ApiResponse.notFound(res, message, details = {})
 * ApiResponse.conflict(res, message, details = {})
 * ApiResponse.validationError(res, message, details = {})
 * ApiResponse.dbError(res, message, details = {})
 * ApiResponse.serverError(res, message, details = {})
 * ApiResponse.error(res, statusCode, message, details = {})
 */

// ═════════════════════════════════════════════════════════════════════════════
// CÓDIGOS HTTP E QUANDO USAR
// ═════════════════════════════════════════════════════════════════════════════

export const HTTP_CODES_GUIDE = {
  // 2xx - Sucesso
  200: "OK - Requisição bem-sucedida, retornando dados",
  201: "Created - Recurso criado com sucesso",
  202: "Accepted - Requisição aceita mas ainda processando",
  204: "No Content - Sucesso mas sem conteúdo (DELETE, UPDATE sem retorno)",
  
  // 3xx - Redirecionamento
  301: "Moved Permanently - URL mudou permanentemente",
  304: "Not Modified - Recurso não foi modificado",
  
  // 4xx - Erro do Cliente
  400: "Bad Request - Requisição mal formatada ou parâmetros inválidos",
  401: "Unauthorized - Autenticação necessária ou inválida",
  403: "Forbidden - Autenticado mas sem permissão",
  404: "Not Found - Recurso não existe",
  409: "Conflict - Conflito (ex: CPF duplicado, violação de constraint)",
  410: "Gone - Recurso foi deletado permanentemente",
  422: "Unprocessable Entity - Validação falhou (Zod errors)",
  429: "Too Many Requests - Rate limit excedido",
  
  // 5xx - Erro do Servidor
  500: "Internal Server Error - Erro geral não esperado",
  501: "Not Implemented - Funcionalidade não implementada",
  503: "Service Unavailable - Servidor indisponível"
};

// ═════════════════════════════════════════════════════════════════════════════
// LISTA DE VERIFICAÇÃO - ANTES DE FAZER COMMIT
// ═════════════════════════════════════════════════════════════════════════════

export const VALIDATION_CHECKLIST = `
✅ VALIDAÇÃO
  [ ] Todos os inputs validados antes de usar
  [ ] CPF validado com algoritmo correto
  [ ] Email validado
  [ ] IDs validados como números positivos
  [ ] Strings validadas (min/max length)
  
✅ ERROS
  [ ] Usando as classes de erro customizadas (ValidationError, NotFoundError, etc)
  [ ] Mensagens de erro amigáveis ao usuário
  [ ] Detalhes técnicos inclusos quando apropriado (em development)
  
✅ LOGGING
  [ ] Operações importantes logadas com logger.info()
  [ ] Avisos logados com logger.warn()
  [ ] Erros logados com logger.error()
  [ ] Dados sensíveis (senhas, tokens) NÃO são logados
  
✅ RESPOSTAS
  [ ] Usando ApiResponse para todas as respostas
  [ ] Campo 'success' sempre presente
  [ ] Campo 'data' contém os dados retornados
  [ ] Códigos HTTP corretos para cada situação
  
✅ SEGURANÇA
  [ ] Não retornando dados sensíveis (senhas, tokens internos)
  [ ] Validação de autorização (role-based)
  [ ] Inputs sanitizados
  [ ] SQL injection prevenido (usando Prisma)
  
✅ PERFORMANCE
  [ ] Paginação implementada para listas grandes
  [ ] Índices criados no banco de dados
  [ ] N+1 queries evitadas (usar include/select do Prisma)
  
✅ TESTES
  [ ] Testado com dados válidos
  [ ] Testado com dados inválidos
  [ ] Testado com dados em limites (boundary)
  [ ] Testado com recursos não existentes
  [ ] Testado sem autenticação
  [ ] Testado com role incorreta
`;
