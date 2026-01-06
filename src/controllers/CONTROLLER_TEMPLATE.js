/**
 * TEMPLATE DE CONTROLLER - EXEMPLO PRONTO PARA USAR
 * 
 * Este arquivo mostra como implementar um controller usando
 * todos os novos utilitários seguindo as melhores práticas
 */

// ═════════════════════════════════════════════════════════════════════════════
// IMPORTS - Sempre no topo
// ═════════════════════════════════════════════════════════════════════════════

import prisma from '../db.js';
import {
  logger,
  ApiResponse,
  validators,
  validarCPF,
  normalizarCPF,
  getPagination,
  ROLES,
  PAGINATION
} from '../utils/index.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthorizationError
} from '../utils/errors.js';

// ═════════════════════════════════════════════════════════════════════════════
// LISTAR (GET /recurso) - Com Paginação
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Lista todos os recursos com paginação
 * 
 * Query params:
 *   - page: número da página (padrão: 1)
 *   - limit: registros por página (padrão: 10, máximo: 100)
 */
export const listarRecursos = async (req, res, next) => {
  try {
    // 1. Extrair parâmetros da query
    const { page = 1, limit = PAGINATION.DEFAULT_LIMIT } = req.query;
    
    // 2. Calcular skip e take
    const { skip, take } = getPagination(page, limit, PAGINATION.MAX_LIMIT);
    
    // 3. Log da operação
    logger.info('Listando recursos', { page, limit });
    
    // 4. Buscar total
    const total = await prisma.recurso.count();
    
    // 5. Buscar registros
    const recursos = await prisma.recurso.findMany({
      skip,
      take,
      orderBy: { id: 'desc' },
      // Não incluir campos sensíveis
      select: {
        id: true,
        nome: true,
        email: true,
        createdAt: true
        // senha: false // NUNCA retornar senhas
      }
    });
    
    logger.info(`${recursos.length} recursos retornados`);
    
    // 6. Retornar com metadata de paginação
    return ApiResponse.success(res, 'Recursos listados com sucesso', {
      recursos,
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
    logger.error('Erro ao listar recursos', { error: error.message });
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// OBTER UM (GET /recurso/:id) - Por ID
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Obtém um recurso por ID
 * 
 * Parâmetros:
 *   - id: ID do recurso (validado pelo middleware)
 */
export const obterRecurso = async (req, res, next) => {
  try {
    // 1. Validar ID (já validado pelo middleware, mas podemos validar novamente)
    const id = req.validatedId || parseInt(req.params.id);
    
    logger.info('Buscando recurso', { id });
    
    // 2. Buscar no banco
    const recurso = await prisma.recurso.findUnique({
      where: { id }
    });
    
    // 3. Verificar se existe
    if (!recurso) {
      logger.warn(`Recurso não encontrado: ${id}`);
      return ApiResponse.notFound(res, 'Recurso não encontrado');
    }
    
    logger.info(`Recurso encontrado: ${id}`);
    
    // 4. Retornar
    return ApiResponse.success(res, 'Recurso encontrado', recurso);
    
  } catch (error) {
    logger.error('Erro ao obter recurso', { error: error.message });
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// CRIAR (POST /recurso)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Cria um novo recurso
 * 
 * Body:
 *   - nome: string (3-100 caracteres) - obrigatório
 *   - email: string válido - obrigatório
 *   - cpf: string - obrigatório e validado
 */
export const criarRecurso = async (req, res, next) => {
  try {
    const { nome, email, cpf } = req.body;
    
    logger.info('Iniciando criação de recurso', { email });
    
    // 1. VALIDAR - Cada campo
    try {
      // Validar nome
      validators.validateString(nome, 3, 100);
      
      // Validar email
      validators.validateEmail(email);
      
      // Validar CPF (se aplicável)
      if (cpf && !validarCPF(cpf)) {
        throw new Error('CPF inválido');
      }
    } catch (validationError) {
      logger.warn(`Validação falhou: ${validationError.message}`);
      return ApiResponse.validationError(res, 'Dados inválidos', {
        error: validationError.message
      });
    }
    
    // 2. VERIFICAR DUPLICATAS
    // Verificar email duplicado
    const recursoComEmail = await prisma.recurso.findUnique({
      where: { email }
    });
    
    if (recursoComEmail) {
      logger.warn(`Email duplicado: ${email}`);
      return ApiResponse.conflict(res, 'Email já está em uso', { field: 'email' });
    }
    
    // Verificar CPF duplicado (se aplicável)
    if (cpf) {
      const recursoComCpf = await prisma.recurso.findUnique({
        where: { cpf: normalizarCPF(cpf) }
      });
      
      if (recursoComCpf) {
        logger.warn(`CPF duplicado: ${cpf}`);
        return ApiResponse.conflict(res, 'CPF já está em uso', { field: 'cpf' });
      }
    }
    
    // 3. CRIAR
    const novoRecurso = await prisma.recurso.create({
      data: {
        nome,
        email,
        cpf: cpf ? normalizarCPF(cpf) : null
        // Outros campos...
      }
    });
    
    logger.info(`Recurso criado com sucesso`, { id: novoRecurso.id, email });
    
    // 4. RETORNAR
    return ApiResponse.created(res, 'Recurso criado com sucesso', novoRecurso);
    
  } catch (error) {
    logger.error(`Erro ao criar recurso: ${error.message}`);
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ATUALIZAR (PUT /recurso/:id)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Atualiza um recurso existente
 * 
 * Parâmetros:
 *   - id: ID do recurso
 * 
 * Body (todos opcionais):
 *   - nome: string
 *   - email: string
 *   - cpf: string
 */
export const atualizarRecurso = async (req, res, next) => {
  try {
    const id = req.validatedId || parseInt(req.params.id);
    const { nome, email, cpf } = req.body;
    
    logger.info('Iniciando atualização de recurso', { id });
    
    // 1. VERIFICAR EXISTÊNCIA
    const recurso = await prisma.recurso.findUnique({
      where: { id }
    });
    
    if (!recurso) {
      logger.warn(`Recurso não encontrado para atualizar: ${id}`);
      return ApiResponse.notFound(res, 'Recurso não encontrado');
    }
    
    // 2. VALIDAR CAMPOS (apenas os que serão atualizados)
    try {
      if (nome !== undefined) {
        validators.validateString(nome, 3, 100);
      }
      if (email !== undefined) {
        validators.validateEmail(email);
      }
      if (cpf !== undefined && cpf !== null) {
        if (!validarCPF(cpf)) {
          throw new Error('CPF inválido');
        }
      }
    } catch (validationError) {
      logger.warn(`Validação falhou na atualização: ${validationError.message}`);
      return ApiResponse.validationError(res, 'Dados inválidos', {
        error: validationError.message
      });
    }
    
    // 3. VERIFICAR DUPLICATAS (para campos únicos)
    if (email && email !== recurso.email) {
      const outro = await prisma.recurso.findUnique({
        where: { email }
      });
      if (outro) {
        logger.warn(`Email duplicado na atualização: ${email}`);
        return ApiResponse.conflict(res, 'Email já está em uso', { field: 'email' });
      }
    }
    
    // 4. ATUALIZAR
    const recursoAtualizado = await prisma.recurso.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(email && { email }),
        ...(cpf && { cpf: normalizarCPF(cpf) })
      }
    });
    
    logger.info(`Recurso atualizado com sucesso: ${id}`);
    
    // 5. RETORNAR
    return ApiResponse.success(res, 'Recurso atualizado com sucesso', recursoAtualizado);
    
  } catch (error) {
    logger.error(`Erro ao atualizar recurso: ${error.message}`);
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// DELETAR (DELETE /recurso/:id)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Deleta um recurso
 * 
 * Parâmetros:
 *   - id: ID do recurso a deletar
 */
export const deletarRecurso = async (req, res, next) => {
  try {
    const id = req.validatedId || parseInt(req.params.id);
    
    logger.info('Iniciando deleção de recurso', { id });
    
    // 1. VERIFICAR EXISTÊNCIA
    const recurso = await prisma.recurso.findUnique({
      where: { id }
    });
    
    if (!recurso) {
      logger.warn(`Recurso não encontrado para deletar: ${id}`);
      return ApiResponse.notFound(res, 'Recurso não encontrado');
    }
    
    // 2. VERIFICAR DEPENDÊNCIAS (se houver)
    // Exemplo: verificar se há matriculas vinculadas
    const temDependencias = await prisma.matricula.count({
      where: { recursoId: id }
    });
    
    if (temDependencias > 0) {
      logger.warn(`Recurso não pode ser deletado, tem dependências: ${id}`);
      return ApiResponse.badRequest(
        res,
        'Não é possível deletar este recurso pois existem dados vinculados'
      );
    }
    
    // 3. DELETAR
    await prisma.recurso.delete({
      where: { id }
    });
    
    logger.info(`Recurso deletado com sucesso: ${id}`);
    
    // 4. RETORNAR
    return ApiResponse.success(res, 'Recurso deletado com sucesso', { id });
    
  } catch (error) {
    logger.error(`Erro ao deletar recurso: ${error.message}`);
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// EXEMPLO AVANÇADO: OPERAÇÃO COM VALIDAÇÕES COMPLEXAS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Exemplo com múltiplas validações e lógica complexa
 */
export const operacaoCompleta = async (req, res, next) => {
  try {
    const { recursoId, acao } = req.body;
    
    logger.info('Operação complexa iniciada', { recursoId, acao, userId: req.user?.id });
    
    // 1. VALIDAR AUTORIZAÇÃO
    if (req.user.role !== ROLES.ADMIN) {
      logger.warn(`Acesso negado para operação complexa`, { userId: req.user.id, role: req.user.role });
      return ApiResponse.forbidden(
        res,
        'Apenas administradores podem executar esta operação'
      );
    }
    
    // 2. VALIDAR PARÂMETROS
    try {
      validators.validateId(recursoId);
      validators.validateEnum(acao, ['ativar', 'desativar', 'arquivar']);
    } catch (error) {
      logger.warn(`Parâmetros inválidos na operação complexa: ${error.message}`);
      return ApiResponse.validationError(res, 'Parâmetros inválidos', {
        error: error.message
      });
    }
    
    // 3. BUSCAR RECURSO
    const recurso = await prisma.recurso.findUnique({
      where: { id: parseInt(recursoId) }
    });
    
    if (!recurso) {
      return ApiResponse.notFound(res, 'Recurso não encontrado');
    }
    
    // 4. EXECUTAR LÓGICA
    let resultado;
    switch (acao) {
      case 'ativar':
        resultado = await prisma.recurso.update({
          where: { id: parseInt(recursoId) },
          data: { ativo: true }
        });
        logger.info(`Recurso ativado: ${recursoId}`);
        break;
        
      case 'desativar':
        resultado = await prisma.recurso.update({
          where: { id: parseInt(recursoId) },
          data: { ativo: false }
        });
        logger.info(`Recurso desativado: ${recursoId}`);
        break;
        
      case 'arquivar':
        resultado = await prisma.recurso.update({
          where: { id: parseInt(recursoId) },
          data: { arquivado: true }
        });
        logger.info(`Recurso arquivado: ${recursoId}`);
        break;
    }
    
    // 5. RETORNAR SUCESSO
    return ApiResponse.success(
      res,
      `Recurso ${acao}do com sucesso`,
      resultado
    );
    
  } catch (error) {
    logger.error(`Erro na operação complexa: ${error.message}`);
    next(error);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// CHECKLIST DE IMPLEMENTAÇÃO
// ═════════════════════════════════════════════════════════════════════════════

/**
 * ANTES DE USAR ESTE TEMPLATE:
 * 
 * ✅ Substitua 'recurso' pelo seu nome (aluno, instrutor, etc)
 * ✅ Adapte os campos conforme seu modelo Prisma
 * ✅ Verifique as validações necessárias
 * ✅ Implemente as dependências se houver relacionamentos
 * ✅ Teste cada função manualmente com curl
 * ✅ Adicione testes automatizados (Jest)
 * ✅ Revise antes de fazer commit
 * 
 * DÚVIDAS?
 * Consulte:
 * - src/docs/UTILITIES_USAGE_GUIDE.js
 * - src/docs/API_RESPONSE_GUIDE.js
 * - src/docs/QUICK_VERIFICATION.js
 */
