import prisma from "../db.js";
import { getPagination, formatMeta } from "../utils/pagination.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { validators } from "../utils/validators.js";

// Funções auxiliares
const normalizeNivel = (valor) => {
  if (!valor) return undefined;
  const map = {
    "basico": "basico",
    "básico": "basico",
    "intermediario": "intermediario",
    "intermediário": "intermediario",
    "avancado": "avancado",
    "avançado": "avancado",
  };
  return map[valor.toLowerCase()];
};

const normalizeModalidade = (valor) => {
  if (!valor) return undefined;
  const map = {
    "presencial": "presencial",
    "online": "online",
    "hibrido": "hibrido",
    "híbrido": "hibrido",
  };
  return map[valor.toLowerCase()];
};

// 🔹 Listar cursos
export const listarCursos = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [cursos, total] = await Promise.all([
      prisma.cursos.findMany({ skip, take: limit, orderBy: { id_curso: 'asc' } }),
      prisma.cursos.count(),
    ]);

    return ApiResponse.success(res, { data: cursos, meta: formatMeta(page, limit, total) }, "Cursos listados com sucesso");
  } catch (err) {
    logger.error("Erro ao listar cursos", { error: err.message, stack: err.stack });
    return ApiResponse.serverError(res, "Erro ao listar cursos");
  }
};

// 🔹 Buscar curso por ID
export const buscarCursoPorId = async (req, res) => {
  try {
    const idValidation = validators.validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const curso = await prisma.cursos.findUnique({
      where: { id_curso: idValidation.data },
    });
    if (!curso) {
      return ApiResponse.notFound(res, "Curso não encontrado");
    }
    return ApiResponse.success(res, curso);
  } catch (err) {
    logger.error("Erro ao buscar curso por ID", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao buscar curso");
  }
};

// 🔹 Criar curso
export const criarCurso = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.data_inicio) {
      const d = new Date(data.data_inicio);
      if (isNaN(d.getTime())) {
        return ApiResponse.badRequest(res, "data_inicio inválida");
      }
      data.data_inicio = d;
    }

    if (data.carga_horaria !== undefined) {
      const ch = parseInt(data.carga_horaria, 10);
      if (isNaN(ch)) {
        return ApiResponse.badRequest(res, "carga_horaria inválida");
      }
      data.carga_horaria = ch;
    }

    if (data.preco !== undefined && data.preco !== null && data.preco !== "") {
      const p = parseFloat(data.preco);
      if (isNaN(p)) {
        return ApiResponse.badRequest(res, "preco inválido");
      }
      data.preco = p;
    }

    data.nivel = normalizeNivel(data.nivel);
    data.modalidade = normalizeModalidade(data.modalidade);

    const novo = await prisma.cursos.create({ data });
    logger.info("Curso criado com sucesso", { id_curso: novo.id_curso, nome: novo.nome });
    return ApiResponse.created(res, novo, "Curso criado com sucesso");
  } catch (err) {
    logger.error("Erro ao criar curso", { error: err.message, body: req.body });
    return ApiResponse.serverError(res, "Erro ao criar curso");
  }
};

// 🔹 Atualizar curso
export const atualizarCurso = async (req, res) => {
  try {
    const idValidation = validators.validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const data = { ...req.body };

    if (data.data_inicio) {
      const d = new Date(data.data_inicio);
      if (isNaN(d.getTime())) {
        return ApiResponse.badRequest(res, "data_inicio inválida");
      }
      data.data_inicio = d;
    }

    if (data.carga_horaria !== undefined) {
      const ch = parseInt(data.carga_horaria, 10);
      if (isNaN(ch)) {
        return ApiResponse.badRequest(res, "carga_horaria inválida");
      }
      data.carga_horaria = ch;
    }

    if (data.preco !== undefined && data.preco !== null && data.preco !== "") {
      const p = parseFloat(data.preco);
      if (isNaN(p)) {
        return ApiResponse.badRequest(res, "preco inválido");
      }
      data.preco = p;
    }

    data.nivel = normalizeNivel(data.nivel);
    data.modalidade = normalizeModalidade(data.modalidade);

    const atualizado = await prisma.cursos.update({
      where: { id_curso: idValidation.data },
      data,
    });

    logger.info("Curso atualizado com sucesso", { id_curso: atualizado.id_curso });
    return ApiResponse.success(res, atualizado, "Curso atualizado com sucesso");
  } catch (err) {
    logger.error("Erro ao atualizar curso", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao atualizar curso");
  }
};

// 🔹 Excluir curso
export const deletarCurso = async (req, res) => {
  try {
    const idValidation = validators.validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const cursoExiste = await prisma.cursos.findUnique({
      where: { id_curso: idValidation.data },
    });

    if (!cursoExiste) {
      return ApiResponse.notFound(res, "Curso não encontrado");
    }

    await prisma.cursos.delete({ where: { id_curso: idValidation.data } });
    logger.info("Curso deletado com sucesso", { id_curso: idValidation.data });
    return ApiResponse.success(res, null, "Curso excluído com sucesso");
  } catch (err) {
    logger.error("Erro ao excluir curso", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao excluir curso");
  }
};
