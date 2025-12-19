import prisma from "../db.js";
import bcrypt from "bcrypt";
import { getPagination, formatMeta } from "../utils/pagination.js";

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
  try {
    const { page, limit, skip } = getPagination(req);

    const [alunos, total] = await Promise.all([
      prisma.alunos.findMany({
        skip,
        take: limit,
        orderBy: { id_aluno: 'asc' }
      }),
      prisma.alunos.count()
    ]);

    const alunosSemSenha = alunos.map(({ senha, ...rest }) => rest);
    res.json({ data: alunosSemSenha, meta: formatMeta(page, limit, total) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar alunos." });
  }
};

// 🔹 Buscar aluno por ID
export const buscarAlunoPorId = async (req, res) => {
  try {
    const aluno = await prisma.alunos.findUnique({
      where: { id_aluno: parseInt(req.params.id) },
    });
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });
    const { senha, ...alunoSemSenha } = aluno;
    res.json(alunoSemSenha);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar aluno." });
  }
};

// 🔹 Criar novo aluno
export const criarAluno = async (req, res) => {
  try {
    const data = { ...req.body };
    const d = normalizarDataNascimento(data.data_nascimento);
    if (d) data.data_nascimento = d;
    else delete data.data_nascimento;

    // Verificar CPF único entre tabelas (alunos, usuarios, instrutores)
    if (data.cpf) {
      // Para alunos, precisamos usar findFirst porque não temos índice único no cpf ainda
      const existsAluno = await prisma.alunos.findFirst({
        where: { cpf: data.cpf }
      });
      // Para usuários e instrutores podemos usar findUnique porque já têm @unique
      const existsUsuario = await prisma.usuarios.findFirst({
        where: { cpf: data.cpf }
      });

      const existsInstrutor = await prisma.instrutores.findUnique({
        where: { cpf: data.cpf }
      });

      if (existsAluno || existsUsuario || existsInstrutor) {
        return res.status(400).json({ error: 'CPF já cadastrado em outro registro' });
      }
    }

    // Se veio senha, hash antes de salvar
    if (data.senha) {
      const hash = await bcrypt.hash(data.senha, 10);
      data.senha = hash;
    }

    const novo = await prisma.alunos.create({ data });
    const { senha, ...novoSemSenha } = novo;

    res.status(201).json({
      message: "Aluno cadastrado com sucesso!",
      aluno: novoSemSenha
    });
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

    // Verificar CPF único entre tabelas se CPF for alterado
    if (data.cpf) {
      const cpf = data.cpf;
      const existsUsuario = await prisma.usuarios.findUnique({ where: { cpf } });
      const existsInstrutor = await prisma.instrutores.findUnique({ where: { cpf } });
      const existsAluno = await prisma.alunos.findFirst({ where: { cpf } });
      // if existsAluno and it's not the same record, conflict
      if ((existsAluno && existsAluno.id_aluno !== parseInt(id)) || existsUsuario || existsInstrutor) {
        return res.status(400).json({ error: 'CPF já cadastrado em outro registro' });
      }
    }

    // Se veio senha para atualização, hash
    if (data.senha) {
      const hash = await bcrypt.hash(data.senha, 10);
      data.senha = hash;
    }

    const atualizado = await prisma.alunos.update({
      where: { id_aluno: parseInt(id) },
      data,
    });
    const { senha, ...atualizadoSemSenha } = atualizado;
    res.json({
      message: "Aluno atualizado com sucesso!",
      aluno: atualizadoSemSenha
    });
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
