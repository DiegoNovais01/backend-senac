import prisma from "../db.js";
import { getPagination, formatMeta } from "../utils/pagination.js";

// Funções auxiliares
const normalizeNivel = (valor) => {
  if (!valor) return undefined;
  const map = {
    "basico": "basico",
    "básico": "basico",
    "intermediario": "intermediario",
    "intermediário": "intermediario",
    "avancado": "avancado",
    "avançado": "avancado",
  };
  return map[valor.toLowerCase()];
};

const normalizeModalidade = (valor) => {
  if (!valor) return undefined;
  const map = {
    "presencial": "presencial",
    "online": "online",
    "hibrido": "hibrido",
    "híbrido": "hibrido",
  };
  return map[valor.toLowerCase()];
};

// 🔹 Listar cursos
export const listarCursos = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [cursos, total] = await Promise.all([
      prisma.cursos.findMany({ skip, take: limit, orderBy: { id_curso: 'asc' } }),
      prisma.cursos.count(),
    ]);

    res.json({ data: cursos, meta: formatMeta(page, limit, total) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar cursos." });
  }
};

// 🔹 Buscar curso por ID
export const buscarCursoPorId = async (req, res) => {
  const curso = await prisma.cursos.findUnique({
    where: { id_curso: parseInt(req.params.id) },
  });
  curso ? res.json(curso) : res.status(404).json({ error: "Curso não encontrado" });
};

// 🔹 Criar curso
export const criarCurso = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.data_inicio) {
      const d = new Date(data.data_inicio);
      if (isNaN(d.getTime())) return res.status(400).json({ error: "data_inicio inválida." });
      data.data_inicio = d;
    }

    if (data.carga_horaria !== undefined) {
      const ch = parseInt(data.carga_horaria, 10);
      if (isNaN(ch)) return res.status(400).json({ error: "carga_horaria inválida." });
      data.carga_horaria = ch;
    }

    if (data.preco !== undefined && data.preco !== null && data.preco !== "") {
      const p = parseFloat(data.preco);
      if (isNaN(p)) return res.status(400).json({ error: "preco inválido." });
      data.preco = p;
    }

    data.nivel = normalizeNivel(data.nivel);
    data.modalidade = normalizeModalidade(data.modalidade);

    const novo = await prisma.cursos.create({ data });
    res.status(201).json({
      message: "Curso adicionado com sucesso!",
      novo: novo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar curso." });
  }
};

// 🔹 Atualizar curso
export const atualizarCurso = async (req, res) => {
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
      if (isNaN(ch)) return res.status(400).json({ error: "carga_horaria inválida." });
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

    res.json({
      message: "Curso atualizado com sucesso!",
      atualizarCurso: atualizado
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar curso." });
  }
};

// 🔹 Excluir curso
export const deletarCurso = async (req, res) => {
  await prisma.cursos.delete({ where: { id_curso: parseInt(req.params.id) } });
  res.json({ message: "Curso excluído com sucesso!" });
};
