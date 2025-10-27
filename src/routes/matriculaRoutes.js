import express from "express";
import prisma from "../db.js";

const router = express.Router();

// 🔹 Listar todas as matrículas
router.get("/", async (req, res) => {
  try {
    const matriculas = await prisma.matriculas.findMany({
      include: { alunos: true, cursos: true },
    });
    res.json(matriculas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar matrículas." });
  }
});

// 🔹 Criar nova matrícula
router.post("/", async (req, res) => {
  const { id_aluno, id_curso, data_matricula } = req.body;

  // Transforma a data, se vier string
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

  res.status(201).json(matricula);
});


// 🔹 Atualizar matrícula 
router.put("/:id", async (req, res) => {
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

  res.json(matriculaAtualizada);
});


// 🔹 Deletar matrícula
router.delete("/:id", async (req, res) => {
  try {
    const id_matricula = parseInt(req.params.id);

    await prisma.matriculas.delete({ where: { id_matricula } });
    res.json({ message: "Matrícula excluída com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir matrícula." });
  }
});

export default router;
