import prisma from "../db.js";

// 🔹 Função auxiliar para validar/normalizar data_nascimento
function normalizarDataNascimento(data) {
  if (data === "" || data === null) return undefined;
  if (data === undefined) return undefined;

  let s = data;

  if (typeof s === "string") {
    s = s.trim();
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) s = `${m[3]}-${m[2]}-${m[1]}`;
  }

  if (typeof s === "number") s = new Date(s);
  const d = new Date(s);
  if (isNaN(d.getTime())) throw new Error("data_nascimento inválida.");
  return d;
}

// 🔹 Listar alunos
export const listarAlunos = async (req, res) => {
  const alunos = await prisma.alunos.findMany();
  res.json(alunos);
};

// 🔹 Buscar aluno por ID
export const buscarAlunoPorId = async (req, res) => {
  const aluno = await prisma.alunos.findUnique({
    where: { id_aluno: parseInt(req.params.id) },
  });
  aluno ? res.json(aluno) : res.status(404).json({ error: "Aluno não encontrado" });
};

// 🔹 Criar novo aluno
export const criarAluno = async (req, res) => {
  try {
    const data = { ...req.body };
    const d = normalizarDataNascimento(data.data_nascimento);
    if (d) data.data_nascimento = d;
    else delete data.data_nascimento;

    const novo = await prisma.alunos.create({ data });
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar aluno." });
  }
};

// 🔹 Atualizar aluno
export const atualizarAluno = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    const d = normalizarDataNascimento(data.data_nascimento);
    if (d) data.data_nascimento = d;
    else delete data.data_nascimento;

    const atualizado = await prisma.alunos.update({
      where: { id_aluno: parseInt(id) },
      data,
    });
    res.json(atualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar aluno." });
  }
};

// 🔹 Deletar aluno
export const deletarAluno = async (req, res) => {
  await prisma.alunos.delete({ where: { id_aluno: parseInt(req.params.id) } });
  res.json({ message: "Aluno removido com sucesso!" });
};
