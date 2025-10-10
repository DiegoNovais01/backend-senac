import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Listar matrículas
router.get("/", async (req, res) => {
  const matriculas = await prisma.matricula.findMany({
    include: { aluno: true, curso: true },
  });
  res.json(matriculas);
});

// Criar nova matrícula
router.post("/", async (req, res) => {
  const { id_aluno, id_curso } = req.body;
  const matricula = await prisma.matricula.create({
    data: {
      id_aluno,
      id_curso,
      status: "ativa",
    },
  });
  res.status(201).json(matricula);
});

export default router;
