import prisma from "../db.js";
import { getPagination, formatMeta } from "../utils/pagination.js";

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

    res.json({ data: matriculas, meta: formatMeta(page, limit, total) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar matrículas." });
  }
};

// 🔹 Buscar matrícula por ID
export const buscarMatriculaPorId = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const matricula = await prisma.matriculas.findUnique({
      where: { id_matricula: id },
      include: { alunos: true, cursos: true },
    });
    if (!matricula) return res.status(404).json({ error: 'Matrícula não encontrada' });
    res.json(matricula);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar matrícula.' });
  }
};

// 🔹 Criar matrícula
export const criarMatricula = async (req, res) => {
  try {
    const { id_aluno, id_curso, data_matricula } = req.body;
    let dataMatricula = data_matricula ? new Date(data_matricula) : new Date();

    if (isNaN(dataMatricula.getTime())) {
      return res.status(400).json({ error: "data_matricula inválida" });
    }

    const matricula = await prisma.matriculas.create({
      data: {
        id_aluno: parseInt(id_aluno),
        id_curso: parseInt(id_curso),
        status: "ativa",
        data_matricula: dataMatricula,
      },
    });

    res.status(200).json({
      message: "Matricula criada com sucesso!",
      data: matricula
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar matrícula." });
  }
};

// 🔹 Atualizar matrícula
export const atualizarMatricula = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_aluno, id_curso, data_matricula, status, nota_final } = req.body;

    const dataAtualizada = {};

    if (id_aluno !== undefined) dataAtualizada.id_aluno = parseInt(id_aluno);
    if (id_curso !== undefined) dataAtualizada.id_curso = parseInt(id_curso);
    if (status !== undefined) dataAtualizada.status = status;
    if (nota_final !== undefined) dataAtualizada.nota_final = parseFloat(nota_final);
    if (data_matricula !== undefined) {
      const d = new Date(data_matricula);
      if (isNaN(d.getTime())) return res.status(400).json({ error: "data_matricula inválida" });
      dataAtualizada.data_matricula = d;
    }

    const matriculaAtualizada = await prisma.matriculas.update({
      where: { id_matricula: parseInt(id) },
      data: dataAtualizada,
    });

    res.json({
      message: "Matricula atualizada com sucesso!",
      data: matriculaAtualizada
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar matrícula." });
  }
};

// 🔹 Excluir matrícula
export const deletarMatricula = async (req, res) => {
  try {
    const id_matricula = parseInt(req.params.id);

    // Validar ID
    if (isNaN(id_matricula)) {
      return res.status(400).json({ error: "ID inválido - deve ser um número" });
    }

    // Verificar se matrícula existe
    const matriculaExiste = await prisma.matriculas.findUnique({
      where: { id_matricula }
    });

    if (!matriculaExiste) {
      return res.status(404).json({ error: "Matrícula não encontrada" });
    }

    await prisma.matriculas.delete({ where: { id_matricula } });
    res.json({ message: "Matrícula excluída com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir matrícula." });
  }
};
