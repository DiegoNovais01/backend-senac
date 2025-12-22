import prisma from "../db.js";
import { getPagination, formatMeta } from "../utils/pagination.js";

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

    res.json({ data: categorias, meta: formatMeta(page, limit, total) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar categorias." });
  }
};

// 🔹 Buscar categoria por ID
export const buscarCategoriaPorId = async (req, res) => {
  try {
    const categoria = await prisma.categorias.findUnique({
      where: { id_categoria: parseInt(req.params.id) },
      include: { cursos: true }
    });
    if (!categoria) return res.status(404).json({ error: "Categoria não encontrada" });
    res.json(categoria);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar categoria." });
  }
};

// 🔹 Criar categoria
export const criarCategoria = async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    // Verificar se categoria já existe
    const existente = await prisma.categorias.findFirst({
      where: { nome: nome.toLowerCase() }
    });

    if (existente) {
      return res.status(400).json({ error: 'Categoria já existe' });
    }

    const nova = await prisma.categorias.create({
      data: { nome, descricao }
    });

    res.status(201).json({
      message: "Categoria criada com sucesso!",
      categoria: nova
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar categoria." });
  }
};

// 🔹 Atualizar categoria
export const atualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    const categoriaExiste = await prisma.categorias.findUnique({
      where: { id_categoria: parseInt(id) }
    });

    if (!categoriaExiste) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    const atualizada = await prisma.categorias.update({
      where: { id_categoria: parseInt(id) },
      data: { nome, descricao }
    });

    res.json({
      message: "Categoria atualizada com sucesso!",
      categoria: atualizada
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar categoria." });
  }
};

// 🔹 Deletar categoria
export const deletarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoriaExiste = await prisma.categorias.findUnique({
      where: { id_categoria: parseInt(id) },
      include: { cursos: true }
    });

    if (!categoriaExiste) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    if (categoriaExiste.cursos.length > 0) {
      return res.status(400).json({
        error: "Não é possível deletar categoria com cursos associados",
        cursos_associados: categoriaExiste.cursos.length
      });
    }

    await prisma.categorias.delete({ where: { id_categoria: parseInt(id) } });
    res.json({ message: "Categoria removida com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar categoria." });
  }
};
