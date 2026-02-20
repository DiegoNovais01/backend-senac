import prisma from "../db.js";
import { getPagination, formatMeta } from "../utils/pagination.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { validateId, validateDate } from "../utils/validators.js";

// 🔹 Listar matrículas
export const listarMatriculas = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [matriculas, total] = await Promise.all([
      prisma.matriculas.findMany({
        skip,
        take: limit,
        include: { alunos: true, cursos: true },
      }),
      prisma.matriculas.count(),
    ]);

    return ApiResponse.success(res, { data: matriculas, meta: formatMeta(page, limit, total) }, "Matrículas listadas com sucesso");
  } catch (err) {
    logger.error("Erro ao buscar matrículas", { error: err.message });
    return ApiResponse.serverError(res, "Erro ao buscar matrículas");
  }
};

// 🔹 Buscar matrícula por ID
export const buscarMatriculaPorId = async (req, res) => {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const matricula = await prisma.matriculas.findUnique({
      where: { id_matricula: idValidation.value },
      include: { alunos: true, cursos: true },
    });
    if (!matricula) {
      return ApiResponse.notFound(res, "Matrícula não encontrada");
    }
    return ApiResponse.success(res, matricula);
  } catch (err) {
    logger.error("Erro ao buscar matrícula por ID", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao buscar matrícula");
  }
};

// 🔹 Criar matrícula
export const criarMatricula = async (req, res) => {
  try {
    const { id_aluno, id_curso, data_matricula } = req.body;

    const alunoValidation = validateId(id_aluno);
    const cursoValidation = validateId(id_curso);

    if (!alunoValidation.valid) {
      return ApiResponse.badRequest(res, "id_aluno inválido");
    }
    if (!cursoValidation.valid) {
      return ApiResponse.badRequest(res, "id_curso inválido");
    }

    let dataMatricula = data_matricula ? new Date(data_matricula) : new Date();

    if (isNaN(dataMatricula.getTime())) {
      return ApiResponse.badRequest(res, "data_matricula inválida");
    }

    const matricula = await prisma.matriculas.create({
      data: {
        id_aluno: alunoValidation.value,
        id_curso: cursoValidation.value,
        status: "ativa",
        data_matricula: dataMatricula,
      },
    });

    logger.info("Matrícula criada com sucesso", { id_matricula: matricula.id_matricula, id_aluno: alunoValidation.value });
    return ApiResponse.created(res, matricula, "Matrícula criada com sucesso");
  } catch (err) {
    logger.error("Erro ao criar matrícula", { error: err.message, body: req.body });
    return ApiResponse.serverError(res, "Erro ao criar matrícula");
  }
};

// 🔹 Atualizar matrícula
export const atualizarMatricula = async (req, res) => {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const { id_aluno, id_curso, data_matricula, status, nota_final } = req.body;

    const dataAtualizada = {};

    if (id_aluno !== undefined) {
      const alunoValidation = validateId(id_aluno);
      if (!alunoValidation.valid) {
        return ApiResponse.badRequest(res, "id_aluno inválido");
      }
      dataAtualizada.id_aluno = alunoValidation.value;
    }

    if (id_curso !== undefined) {
      const cursoValidation = validateId(id_curso);
      if (!cursoValidation.valid) {
        return ApiResponse.badRequest(res, "id_curso inválido");
      }
      dataAtualizada.id_curso = cursoValidation.value;
    }

    if (status !== undefined) {
      dataAtualizada.status = status;
    }
    if (nota_final !== undefined) {
      dataAtualizada.nota_final = parseFloat(nota_final);
    }
    if (data_matricula !== undefined) {
      const d = new Date(data_matricula);
      if (isNaN(d.getTime())) {
        return ApiResponse.badRequest(res, "data_matricula inválida");
      }
      dataAtualizada.data_matricula = d;
    }

    const matriculaAtualizada = await prisma.matriculas.update({
      where: { id_matricula: idValidation.value },
      data: dataAtualizada,
    });

    logger.info("Matrícula atualizada com sucesso", { id_matricula: idValidation.value });
    return ApiResponse.success(res, matriculaAtualizada, "Matrícula atualizada com sucesso");
  } catch (err) {
    logger.error("Erro ao atualizar matrícula", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao atualizar matrícula");
  }
};

// 🔹 Excluir matrícula
export const deletarMatricula = async (req, res) => {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    // Verificar se matrícula existe
    const matriculaExiste = await prisma.matriculas.findUnique({
      where: { id_matricula: idValidation.value }
    });

    if (!matriculaExiste) {
      return ApiResponse.notFound(res, "Matrícula não encontrada");
    }

    await prisma.matriculas.delete({ where: { id_matricula: idValidation.value } });
    logger.info("Matrícula deletada com sucesso", { id_matricula: idValidation.value });
    return ApiResponse.success(res, null, "Matrícula excluída com sucesso");
  } catch (err) {
    logger.error("Erro ao excluir matrícula", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao excluir matrícula");
  }
};
