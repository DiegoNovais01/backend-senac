import prisma from "../db.js";
import { getPagination, formatMeta } from "../utils/pagination.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { validateId, validateString } from "../utils/validators.js";

// 🔹 Listar categorias
export const listarCategorias = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [categorias, total] = await Promise.all([
      prisma.categorias.findMany({
        skip,
        take: limit,
        orderBy: { id_categoria: 'asc' }
      }),
      prisma.categorias.count()
    ]);

    return ApiResponse.success(res, { data: categorias, meta: formatMeta(page, limit, total) }, "Categorias listadas com sucesso");
  } catch (err) {
    logger.error("Erro ao listar categorias", { error: err.message });
    return ApiResponse.serverError(res, "Erro ao listar categorias");
  }
};

// 🔹 Buscar categoria por ID
export const buscarCategoriaPorId = async (req, res) => {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const categoria = await prisma.categorias.findUnique({
      where: { id_categoria: idValidation.data },
      include: { cursos: true }
    });
    if (!categoria) {
      return ApiResponse.notFound(res, "Categoria não encontrada");
    }
    return ApiResponse.success(res, categoria);
  } catch (err) {
    logger.error("Erro ao buscar categoria por ID", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao buscar categoria");
  }
};

// 🔹 Criar categoria
export const criarCategoria = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    const nomeValidation = validateString(nome, { min: 3, max: 100 });
    if (!nomeValidation.valid) {
      return ApiResponse.badRequest(res, "Nome deve ter entre 3 e 100 caracteres");
    }

    // Verificar se categoria já existe
    const existente = await prisma.categorias.findFirst({
      where: { nome: nomeValidation.data.toLowerCase() }
    });

    if (existente) {
      return ApiResponse.conflict(res, "Categoria já existe");
    }

    const nova = await prisma.categorias.create({
      data: { nome: nomeValidation.data, descricao }
    });

    logger.info("Categoria criada com sucesso", { id_categoria: nova.id_categoria, nome: nova.nome });
    return ApiResponse.created(res, nova, "Categoria criada com sucesso");
  } catch (err) {
    logger.error("Erro ao criar categoria", { error: err.message, body: req.body });
    return ApiResponse.serverError(res, "Erro ao criar categoria");
  }
};

// 🔹 Atualizar categoria
export const atualizarCategoria = async (req, res) => {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const { nome, descricao } = req.body;

    const categoriaExiste = await prisma.categorias.findUnique({
      where: { id_categoria: idValidation.data }
    });

    if (!categoriaExiste) {
      return ApiResponse.notFound(res, "Categoria não encontrada");
    }

    const atualizada = await prisma.categorias.update({
      where: { id_categoria: idValidation.data },
      data: { nome, descricao }
    });

    logger.info("Categoria atualizada com sucesso", { id_categoria: idValidation.data });
    return ApiResponse.success(res, atualizada, "Categoria atualizada com sucesso");
  } catch (err) {
    logger.error("Erro ao atualizar categoria", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao atualizar categoria");
  }
};

// 🔹 Deletar categoria
export const deletarCategoria = async (req, res) => {
  try {
    const idValidation = validateId(req.params.id);
    if (!idValidation.valid) {
      return ApiResponse.badRequest(res, idValidation.error);
    }

    const categoriaExiste = await prisma.categorias.findUnique({
      where: { id_categoria: idValidation.data },
      include: { cursos: true }
    });

    if (!categoriaExiste) {
      return ApiResponse.notFound(res, "Categoria não encontrada");
    }

    if (categoriaExiste.cursos.length > 0) {
      return ApiResponse.conflict(res, `Não é possível deletar categoria com ${categoriaExiste.cursos.length} curso(s) associado(s)`);
    }

    await prisma.categorias.delete({ where: { id_categoria: idValidation.data } });
    logger.info("Categoria deletada com sucesso", { id_categoria: idValidation.data });
    return ApiResponse.success(res, null, "Categoria removida com sucesso");
  } catch (err) {
    logger.error("Erro ao deletar categoria", { id: req.params.id, error: err.message });
    return ApiResponse.serverError(res, "Erro ao deletar categoria");
  }
};
