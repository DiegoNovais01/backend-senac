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

// Criar novo aluno (validação/normalização repetida)
router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };

    // Validação/normalização de data_nascimento (duplicada)
    if (data.data_nascimento === "" || data.data_nascimento === null) {
      delete data.data_nascimento;
    } else if (data.data_nascimento !== undefined) {
      let s = data.data_nascimento;

      // Aceita DD/MM/YYYY -> converte para YYYY-MM-DD
      if (typeof s === "string") {
        s = s.trim();
        const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) s = `${m[3]}-${m[2]}-${m[1]}`;
      }

      // Aceita timestamp numérico
      if (typeof s === "number") s = new Date(s);

      const d = new Date(s);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ error: "data_nascimento inválida. Use YYYY-MM-DD, ISO-8601 ou DD/MM/YYYY." });
      }
      data.data_nascimento = d;
    }

    const novo = await prisma.alunos.create({ data });
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar aluno." });
  }
});

// Atualizar aluno (mesma validação/normalização repetida)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // ===== validação/normalização de data_nascimento (duplicada) =====
    if (data.data_nascimento === "" || data.data_nascimento === null) {
      delete data.data_nascimento;
    } else if (data.data_nascimento !== undefined) {
      let s = data.data_nascimento;

      if (typeof s === "string") {
        s = s.trim();
        const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) s = `${m[3]}-${m[2]}-${m[1]}`;
      }

      if (typeof s === "number") s = new Date(s);

      const d = new Date(s);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ error: "data_nascimento inválida. Use YYYY-MM-DD, ISO-8601 ou DD/MM/YYYY." });
      }
      data.data_nascimento = d;
    }

    const atualizado = await prisma.alunos.update({
      where: { id_aluno: parseInt(id) },
      data,
    });
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar aluno." });
  }
});

// Deletar aluno
router.delete("/:id", async (req, res) => {
  await prisma.alunos.delete({ where: { id_aluno: parseInt(req.params.id) } });
  res.json({ message: "Aluno removido com sucesso!" });
});

export default router;
