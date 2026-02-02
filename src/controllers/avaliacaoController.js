import prisma from "../db.js";
import { getPagination, formatMeta } from "../utils/pagination.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { validators } from "../utils/validators.js";

// 🔹 Listar avaliações
export const listarAvaliacoes = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { id_curso, id_aluno } = req.query;

    const where = {};
    if (id_curso) {
      const cursoValidation = validators.validateId(id_curso);
      if (!cursoValidation.valid) {
        return ApiResponse.badRequest(res, "id_curso inválido");
      }
      where.id_curso = cursoValidation.data;
    }
    if (id_aluno) {
      const alunoValidation = validators.validateId(id_aluno);
      if (!alunoValidation.valid) {
        return ApiResponse.badRequest(res, "id_aluno inválido");
      }
      where.id_aluno = alunoValidation.data;
    }

    const [avaliacoes, total] = await Promise.all([
      prisma.avaliacoes.findMany({
        where,
        skip,
        take: limit,
        include: { cursos: true, alunos: true },
        orderBy: { data_avaliacao: 'desc' }
      }),
      prisma.avaliacoes.count({ where })
    ]);

    return ApiResponse.success(res, { data: avaliacoes, meta: formatMeta(page, limit, total) }, "Avaliações listadas com sucesso");
  } catch (err) {
    logger.error("Erro ao listar avaliações", { error: err.message });
    return ApiResponse.serverError(res, "Erro ao listar avaliações");
  }
};

// 🔹 Buscar avaliação por ID
export const buscarAvaliacaoPorId = async (req, res) => {
  try {
    const idValidation = validators.validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const avaliacao = await prisma.avaliacoes.findUnique({
      where: { id_avaliacao: idValidation.data },
      include: { cursos: true, alunos: true }
    });
    if (!avaliacao) {
      return ApiResponse.notFound(res, "Avaliação não encontrada");
    }
    return ApiResponse.success(res, avaliacao);
  } catch (err) {
    logger.error("Erro ao buscar avaliação por ID", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao buscar avaliação");
  }
};

// 🔹 Criar avaliação
export const criarAvaliacao = async (req, res) => {
  try {
    const { id_curso, id_aluno, nota, comentario } = req.body;

    const cursoValidation = validators.validateId(id_curso);
    const alunoValidation = validators.validateId(id_aluno);
    const notaValidation = validators.validateInt(nota, { min: 0, max: 10 });

    if (!cursoValidation.valid) {
      return ApiResponse.badRequest(res, "id_curso inválido");
    }
    if (!alunoValidation.valid) {
      return ApiResponse.badRequest(res, "id_aluno inválido");
    }
    if (!notaValidation.valid) {
      return ApiResponse.badRequest(res, "nota deve ser um número entre 0 e 10");
    }

    // Verificar se curso existe
    const cursoExiste = await prisma.cursos.findUnique({
      where: { id_curso: cursoValidation.data }
    });

    if (!cursoExiste) {
      return ApiResponse.notFound(res, "Curso não encontrado");
    }

    // Verificar se aluno existe
    const alunoExiste = await prisma.alunos.findUnique({
      where: { id_aluno: alunoValidation.data }
    });

    if (!alunoExiste) {
      return ApiResponse.notFound(res, "Aluno não encontrado");
    }

    // Verificar se aluno está matriculado neste curso
    const matriculaExiste = await prisma.matriculas.findFirst({
      where: {
        id_aluno: alunoValidation.data,
        id_curso: cursoValidation.data
      }
    });

    if (!matriculaExiste) {
      return ApiResponse.badRequest(res, "Aluno não está matriculado neste curso");
    }

    const nova = await prisma.avaliacoes.create({
      data: {
        id_curso: cursoValidation.data,
        id_aluno: alunoValidation.data,
        nota: notaValidation.data,
        comentario
      }
    });

    logger.info("Avaliação criada com sucesso", { id_avaliacao: nova.id_avaliacao, id_aluno: alunoValidation.data });
    return ApiResponse.created(res, nova, "Avaliação criada com sucesso");
  } catch (err) {
    logger.error("Erro ao criar avaliação", { error: err.message, body: req.body });
    return ApiResponse.serverError(res, "Erro ao criar avaliação");
  }
};

// 🔹 Atualizar avaliação
export const atualizarAvaliacao = async (req, res) => {
  try {
    const idValidation = validators.validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const { nota, comentario } = req.body;

    const avaliacaoExiste = await prisma.avaliacoes.findUnique({
      where: { id_avaliacao: idValidation.data }
    });

    if (!avaliacaoExiste) {
      return ApiResponse.notFound(res, "Avaliação não encontrada");
    }

    const atualizada = await prisma.avaliacoes.update({
      where: { id_avaliacao: idValidation.data },
      data: {
        nota: nota ? parseInt(nota) : undefined,
        comentario
      }
    });

    logger.info("Avaliação atualizada com sucesso", { id_avaliacao: idValidation.data });
    return ApiResponse.success(res, atualizada, "Avaliação atualizada com sucesso");
  } catch (err) {
    logger.error("Erro ao atualizar avaliação", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao atualizar avaliação");
  }
};

// 🔹 Deletar avaliação
export const deletarAvaliacao = async (req, res) => {
  try {
    const idValidation = validators.validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const avaliacaoExiste = await prisma.avaliacoes.findUnique({
      where: { id_avaliacao: idValidation.data }
    });

    if (!avaliacaoExiste) {
      return ApiResponse.notFound(res, "Avaliação não encontrada");
    }

    await prisma.avaliacoes.delete({ where: { id_avaliacao: idValidation.data } });
    logger.info("Avaliação deletada com sucesso", { id_avaliacao: idValidation.data });
    return ApiResponse.success(res, null, "Avaliação removida com sucesso");
  } catch (err) {
    logger.error("Erro ao deletar avaliação", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao deletar avaliação");
  }
};
