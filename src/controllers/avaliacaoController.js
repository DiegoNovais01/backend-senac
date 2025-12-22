import prisma from "../db.js";
import { getPagination, formatMeta } from "../utils/pagination.js";

// 🔹 Listar avaliações
export const listarAvaliacoes = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { id_curso, id_aluno } = req.query;

    const where = {};
    if (id_curso) where.id_curso = parseInt(id_curso);
    if (id_aluno) where.id_aluno = parseInt(id_aluno);

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

    res.json({ data: avaliacoes, meta: formatMeta(page, limit, total) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar avaliações." });
  }
};

// 🔹 Buscar avaliação por ID
export const buscarAvaliacaoPorId = async (req, res) => {
  try {
    const avaliacao = await prisma.avaliacoes.findUnique({
      where: { id_avaliacao: parseInt(req.params.id) },
      include: { cursos: true, alunos: true }
    });
    if (!avaliacao) return res.status(404).json({ error: "Avaliação não encontrada" });
    res.json(avaliacao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar avaliação." });
  }
};

// 🔹 Criar avaliação
export const criarAvaliacao = async (req, res) => {
  try {
    const { id_curso, id_aluno, nota, comentario } = req.body;

    // Verificar se curso existe
    const cursoExiste = await prisma.cursos.findUnique({
      where: { id_curso: parseInt(id_curso) }
    });

    if (!cursoExiste) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    // Verificar se aluno existe
    const alunoExiste = await prisma.alunos.findUnique({
      where: { id_aluno: parseInt(id_aluno) }
    });

    if (!alunoExiste) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Verificar se aluno está matriculado neste curso
    const matriculaExiste = await prisma.matriculas.findFirst({
      where: {
        id_aluno: parseInt(id_aluno),
        id_curso: parseInt(id_curso)
      }
    });

    if (!matriculaExiste) {
      return res.status(400).json({ error: "Aluno não está matriculado neste curso" });
    }

    const nova = await prisma.avaliacoes.create({
      data: {
        id_curso: parseInt(id_curso),
        id_aluno: parseInt(id_aluno),
        nota: parseInt(nota),
        comentario
      }
    });

    res.status(201).json({
      message: "Avaliação criada com sucesso!",
      avaliacao: nova
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar avaliação." });
  }
};

// 🔹 Atualizar avaliação
export const atualizarAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { nota, comentario } = req.body;

    const avaliacaoExiste = await prisma.avaliacoes.findUnique({
      where: { id_avaliacao: parseInt(id) }
    });

    if (!avaliacaoExiste) {
      return res.status(404).json({ error: "Avaliação não encontrada" });
    }

    const atualizada = await prisma.avaliacoes.update({
      where: { id_avaliacao: parseInt(id) },
      data: {
        nota: nota ? parseInt(nota) : undefined,
        comentario
      }
    });

    res.json({
      message: "Avaliação atualizada com sucesso!",
      avaliacao: atualizada
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar avaliação." });
  }
};

// 🔹 Deletar avaliação
export const deletarAvaliacao = async (req, res) => {
  try {
    const { id } = req.params;

    const avaliacaoExiste = await prisma.avaliacoes.findUnique({
      where: { id_avaliacao: parseInt(id) }
    });

    if (!avaliacaoExiste) {
      return res.status(404).json({ error: "Avaliação não encontrada" });
    }

    await prisma.avaliacoes.delete({ where: { id_avaliacao: parseInt(id) } });
    res.json({ message: "Avaliação removida com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar avaliação." });
  }
};
