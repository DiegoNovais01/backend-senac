import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Listar alunos
router.get("/", async (req, res) => {
  const alunos = await prisma.alunos.findMany();
  res.json(alunos);
});

// Buscar aluno por ID
router.get("/:id", async (req, res) => {
  const aluno = await prisma.alunos.findUnique({
    where: { id_aluno: parseInt(req.params.id) },
  });
  aluno ? res.json(aluno) : res.status(404).json({ error: "Aluno não encontrado" });
});

// Criar novo aluno
router.post("/", async (req, res) => {
  const novo = await prisma.alunos.create({ data: req.body });
  res.status(201).json(novo);
});

// Atualizar aluno
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const atualizado = await prisma.alunos.update({
    where: { id_aluno: parseInt(id) },
    data: req.body,
  });
  res.json(atualizado);
});

// Deletar aluno
router.delete("/:id", async (req, res) => {
  await prisma.alunos.delete({ where: { id_aluno: parseInt(req.params.id) } });
  res.json({ message: "Aluno removido com sucesso!" });
});

export default router;
