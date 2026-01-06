// Guia de Boas Práticas para Controllers
/*

╔══════════════════════════════════════════════════════════════════════╗
║         GUIA DE BOAS PRÁTICAS PARA CONTROLLERS DA API SENAC          ║
╚══════════════════════════════════════════════════════════════════════╝

1. ESTRUTURA BÁSICA DE UM CONTROLLER
═════════════════════════════════════════

import prisma from "../db.js";
import { ApiResponse, ERROR_MESSAGES } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

export const meuController = async (req, res) => {
  try {
    // Validação
    // Lógica
    // Resposta
  } catch (err) {
    logger.error('Erro em meuController', err);
    ApiResponse.serverError(res, 'Erro ao processar requisição', err);
  }
};


2. VALIDAÇÃO DE INPUTS
═════════════════════════════════════════

import { validators } from "../utils/validators.js";

// Validar ID do parâmetro
const idValidation = validators.validateId(req.params.id);
if (!idValidation.valid) {
  return ApiResponse.badRequest(res, idValidation.error);
}
const id = idValidation.value;

// Validar email
const emailValidation = validators.validateEmail(req.body.email);
if (!emailValidation.valid) {
  return ApiResponse.badRequest(res, emailValidation.error);
}

// Validar enum (ex: status de matrícula)
const statusValidation = validators.validateEnum(
  req.body.status, 
  ['ativa', 'concluida', 'cancelada'], 
  'Status'
);
if (!statusValidation.valid) {
  return ApiResponse.badRequest(res, statusValidation.error);
}


3. USAR ApiResponse PARA RESPOSTAS
═════════════════════════════════════════

// Sucesso
return ApiResponse.success(res, { id: 1, nome: 'João' }, 200, 'Aluno encontrado');

// Criado
return ApiResponse.created(res, { id: 1, nome: 'João' });

// Bad Request
return ApiResponse.badRequest(res, 'Email já existe');

// Not Found
return ApiResponse.notFound(res, 'Aluno não encontrado');

// Unauthorized
return ApiResponse.unauthorized(res);

// Forbidden
return ApiResponse.forbidden(res);

// Erro de Banco de Dados
return ApiResponse.dbError(res, error, 'criar aluno');


4. LOGGING
═════════════════════════════════════════

import { logger } from "../utils/logger.js";

// Info (operações bem-sucedidas)
logger.info('Aluno criado com sucesso', { id: 1, nome: 'João' });

// Warn (situações incomuns)
logger.warn('Tentativa de acesso a aluno deletado', { id: 999 });

// Error (erros)
logger.error('Erro ao criar aluno', err);

// Debug (informações de debug)
logger.debug('Parâmetros da requisição', { page: 1, limit: 10 });


5. PADRÃO DE CRIAÇÃO (CREATE)
═════════════════════════════════════════

export const criarAluno = async (req, res) => {
  try {
    // 1. Validar inputs
    if (!req.body.nome) {
      return ApiResponse.badRequest(res, 'Nome é obrigatório');
    }

    // 2. Verificar duplicatas
    const jaCadastrado = await prisma.alunos.findFirst({
      where: { cpf: req.body.cpf }
    });
    if (jaCadastrado) {
      return ApiResponse.badRequest(res, 'CPF já cadastrado');
    }

    // 3. Criar registro
    const novo = await prisma.alunos.create({
      data: req.body
    });

    // 4. Log e resposta
    logger.info('Aluno criado', { id: novo.id_aluno });
    return ApiResponse.created(res, novo);

  } catch (err) {
    logger.error('Erro ao criar aluno', err);
    return ApiResponse.dbError(res, err, 'criar aluno');
  }
};


6. PADRÃO DE ATUALIZAÇÃO (UPDATE)
═════════════════════════════════════════

export const atualizarAluno = async (req, res) => {
  try {
    // 1. Validar ID
    const idValidation = validators.validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    // 2. Verificar se existe
    const aluno = await prisma.alunos.findUnique({
      where: { id_aluno: idValidation.value }
    });
    if (!aluno) {
      return ApiResponse.notFound(res, 'Aluno não encontrado');
    }

    // 3. Atualizar
    const atualizado = await prisma.alunos.update({
      where: { id_aluno: idValidation.value },
      data: req.body
    });

    logger.info('Aluno atualizado', { id: idValidation.value });
    return ApiResponse.success(res, atualizado);

  } catch (err) {
    logger.error('Erro ao atualizar aluno', err);
    return ApiResponse.dbError(res, err, 'atualizar aluno');
  }
};


7. PADRÃO DE DELEÇÃO (DELETE)
═════════════════════════════════════════

export const deletarAluno = async (req, res) => {
  try {
    // 1. Validar ID
    const idValidation = validators.validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    // 2. Verificar se existe
    const aluno = await prisma.alunos.findUnique({
      where: { id_aluno: idValidation.value }
    });
    if (!aluno) {
      return ApiResponse.notFound(res, 'Aluno não encontrado');
    }

    // 3. Verificar dependências (se houver)
    const matriculas = await prisma.matriculas.findMany({
      where: { id_aluno: idValidation.value }
    });
    if (matriculas.length > 0) {
      return ApiResponse.badRequest(
        res, 
        'Não é possível deletar aluno com matrículas ativas'
      );
    }

    // 4. Deletar
    await prisma.alunos.delete({
      where: { id_aluno: idValidation.value }
    });

    logger.info('Aluno deletado', { id: idValidation.value });
    return ApiResponse.success(res, { message: 'Aluno deletado com sucesso' });

  } catch (err) {
    logger.error('Erro ao deletar aluno', err);
    return ApiResponse.dbError(res, err, 'deletar aluno');
  }
};


8. PADRÃO DE LISTAGEM COM PAGINAÇÃO (LIST)
═════════════════════════════════════════

export const listarAlunos = async (req, res) => {
  try {
    // 1. Obter parâmetros de paginação
    const { page, limit, skip } = getPagination(req);

    // 2. Executar queries em paralelo
    const [alunos, total] = await Promise.all([
      prisma.alunos.findMany({
        skip,
        take: limit,
        orderBy: { id_aluno: 'asc' }
      }),
      prisma.alunos.count()
    ]);

    // 3. Formatar resposta
    logger.debug('Listando alunos', { page, limit, total });
    return ApiResponse.success(res, {
      data: alunos,
      meta: formatMeta(page, limit, total)
    });

  } catch (err) {
    logger.error('Erro ao listar alunos', err);
    return ApiResponse.serverError(res, 'Erro ao listar alunos', err);
  }
};


9. PADRÃO DE BUSCA POR ID (GET BY ID)
═════════════════════════════════════════

export const buscarAlunoPorId = async (req, res) => {
  try {
    // 1. Validar ID
    const idValidation = validators.validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    // 2. Buscar
    const aluno = await prisma.alunos.findUnique({
      where: { id_aluno: idValidation.value }
    });

    if (!aluno) {
      return ApiResponse.notFound(res, 'Aluno não encontrado');
    }

    return ApiResponse.success(res, aluno);

  } catch (err) {
    logger.error('Erro ao buscar aluno', err);
    return ApiResponse.serverError(res, 'Erro ao buscar aluno', err);
  }
};


10. CHECKLIST FINAL
═════════════════════════════════════════

□ Validar todos os inputs
□ Verificar autorizações (se necessário)
□ Usar try/catch
□ Usar ApiResponse para respostas
□ Logar informações importantes
□ Tratar erros do Prisma
□ Não retornar senhas ou dados sensíveis
□ Usar transações para múltiplas operações
□ Documentar respostas no Swagger
□ Testar casos de erro

*/

export const BEST_PRACTICES = {
  description: 'Guia de boas práticas para controllers',
  version: '1.0.0'
};
