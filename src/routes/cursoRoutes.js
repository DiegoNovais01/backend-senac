import express from "express";
import prisma from "../db.js";

const router = express.Router();

// Função de normalização de enums
const normalizeNivel = (valor) => {
  if (!valor) return undefined;
  const mapNivel = {
    "basico": "basico",
    "básico": "basico",
    "intermediario": "intermediario",
    "intermediário": "intermediario",
    "avancado": "avancado",
    "avançado": "avancado"
  };
  return mapNivel[valor.toLowerCase()];
};

const normalizeModalidade = (valor) => {
  if (!valor) return undefined;
  const mapModal = {
    "presencial": "presencial",
    "online": "online",
    "hibrido": "hibrido",
    "híbrido": "hibrido"
  };
  return mapModal[valor.toLowerCase()];
};

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
  try {
    const data = { ...req.body };

    // Normalizar data_inicio
    if (data.data_inicio) {
      const d = new Date(data.data_inicio);
      if (isNaN(d.getTime())) return res.status(400).json({ error: "data_inicio inválida." });
      data.data_inicio = d;
    }

    // Normalizar carga_horaria
    if (data.carga_horaria !== undefined) {
      const ch = parseInt(data.carga_horaria, 10);
      if (isNaN(ch)) return res.status(400).json({ error: "carga_horaria deve ser número inteiro." });
      data.carga_horaria = ch;
    }

    // Normalizar preco
    if (data.preco !== undefined && data.preco !== null && data.preco !== "") {
      const p = parseFloat(data.preco);
      if (isNaN(p)) return res.status(400).json({ error: "preco inválido." });
      data.preco = p;
    }

    // Normalizar enums
    data.nivel = normalizeNivel(data.nivel);
    data.modalidade = normalizeModalidade(data.modalidade);

    const novo = await prisma.cursos.create({ data });
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar curso." });
  }
});

// ✏️ Atualizar curso
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    if (data.data_inicio) {
      const d = new Date(data.data_inicio);
      if (isNaN(d.getTime())) return res.status(400).json({ error: "data_inicio inválida." });
      data.data_inicio = d;
    }

    if (data.carga_horaria !== undefined) {
      const ch = parseInt(data.carga_horaria, 10);
      if (isNaN(ch)) return res.status(400).json({ error: "carga_horaria deve ser número inteiro." });
      data.carga_horaria = ch;
    }

    if (data.preco !== undefined && data.preco !== null && data.preco !== "") {
      const p = parseFloat(data.preco);
      if (isNaN(p)) return res.status(400).json({ error: "preco inválido." });
      data.preco = p;
    }

    data.nivel = normalizeNivel(data.nivel);
    data.modalidade = normalizeModalidade(data.modalidade);

    const atualizado = await prisma.cursos.update({
      where: { id_curso: parseInt(id) },
      data,
    });

    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar curso." });
  }
});

// ❌ Excluir curso
router.delete("/:id", async (req, res) => {
  try {
    await prisma.cursos.delete({ where: { id_curso: parseInt(req.params.id) } });
    res.json({ message: "Curso excluído com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir curso." });
  }
});

export default router;
