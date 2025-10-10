import express from "express";
import prisma from "../db.js";

const router = express.Router();

// 🧾 Listar todos os cursos
router.get("/", async (req, res) => {
  const cursos = await prisma.cursos.findMany();
  res.json(cursos);
});

// 🔍 Buscar curso por ID
router.get("/:id", async (req, res) => {
  const curso = await prisma.cursos.findUnique({
    where: { id_curso: parseInt(req.params.id) },
  });
  curso ? res.json(curso) : res.status(404).json({ error: "Curso não encontrado" });
});

// ➕ Criar novo curso
router.post("/", async (req, res) => {
  const data = req.body;
  const novo = await prisma.cursos.create({ data });
  res.status(201).json(novo);
});

// ✏️ Atualizar curso
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const atualizado = await prisma.cursos.update({
    where: { id_curso: parseInt(id) },
    data,
  });
  res.json(atualizado);
});

// ❌ Excluir curso
router.delete("/:id", async (req, res) => {
  await prisma.cursos.delete({ where: { id_curso: parseInt(req.params.id) } });
  res.json({ message: "Curso excluído com sucesso!" });
});

export default router;
