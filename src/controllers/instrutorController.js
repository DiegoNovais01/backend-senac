import prisma from "../db.js";
import { getPagination, formatMeta } from "../utils/pagination.js";
import { validarCPF, normalizarCPF } from "../utils/cpfValidator.js";

// 🔹 Listar instrutores
export const listarInstrutores = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const [instrutores, total] = await Promise.all([
      prisma.instrutores.findMany({
        skip,
        take: limit,
        orderBy: { id_instrutor: 'asc' }
      }),
      prisma.instrutores.count()
    ]);

    res.json({ data: instrutores, meta: formatMeta(page, limit, total) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar instrutores." });
  }
};

// 🔹 Buscar instrutor por ID
export const buscarInstrutorPorId = async (req, res) => {
  try {
    const instrutor = await prisma.instrutores.findUnique({
      where: { id_instrutor: parseInt(req.params.id) },
    });
    if (!instrutor) return res.status(404).json({ error: "Instrutor não encontrado" });
    res.json(instrutor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar instrutor." });
  }
};

// 🔹 Criar instrutor
export const criarInstrutor = async (req, res) => {
  try {
    const data = { ...req.body };

    // Verificar CPF único entre tabelas
    if (data.cpf) {
      const cpfNormalizado = normalizarCPF(data.cpf);

      // Validar formato do CPF
      if (!validarCPF(cpfNormalizado)) {
        return res.status(400).json({
          error: 'CPF inválido. Deve conter 11 dígitos válidos (exemplo: 123.456.789-10)'
        });
      }

      data.cpf = cpfNormalizado;

      const existsAluno = await prisma.alunos.findFirst({
        where: { cpf: cpfNormalizado }
      });
      const existsUsuario = await prisma.usuarios.findFirst({
        where: { cpf: cpfNormalizado }
      });
      const existsInstrutor = await prisma.instrutores.findUnique({
        where: { cpf: cpfNormalizado }
      });

      if (existsAluno || existsUsuario || existsInstrutor) {
        return res.status(400).json({ error: 'CPF já cadastrado em outro registro' });
      }
    }

    const novo = await prisma.instrutores.create({ data });

    res.status(201).json({
      message: "Instrutor cadastrado com sucesso!",
      instrutor: novo
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar instrutor." });
  }
};

// 🔹 Atualizar instrutor
export const atualizarInstrutor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Verificar CPF único se for alterado
    if (data.cpf) {
      const cpfNormalizado = normalizarCPF(data.cpf);

      // Validar formato do CPF
      if (!validarCPF(cpfNormalizado)) {
        return res.status(400).json({
          error: 'CPF inválido. Deve conter 11 dígitos válidos (exemplo: 123.456.789-10)'
        });
      }

      data.cpf = cpfNormalizado;

      const existsAluno = await prisma.alunos.findFirst({ where: { cpf: cpfNormalizado } });
      const existsUsuario = await prisma.usuarios.findUnique({ where: { cpf: cpfNormalizado } });
      const existsInstrutor = await prisma.instrutores.findFirst({ where: { cpf: cpfNormalizado } });

      if ((existsInstrutor && existsInstrutor.id_instrutor !== parseInt(id)) || existsAluno || existsUsuario) {
        return res.status(400).json({ error: 'CPF já cadastrado em outro registro' });
      }
    }

    const atualizado = await prisma.instrutores.update({
      where: { id_instrutor: parseInt(id) },
      data,
    });

    res.json({
      message: "Instrutor atualizado com sucesso!",
      instrutor: atualizado
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar instrutor." });
  }
};

// 🔹 Deletar instrutor
export const deletarInstrutor = async (req, res) => {
  try {
    const { id } = req.params;
    const instrutorExiste = await prisma.instrutores.findUnique({
      where: { id_instrutor: parseInt(id) },
    });

    if (!instrutorExiste) {
      return res.status(404).json({ error: "Instrutor não encontrado" });
    }

    await prisma.instrutores.delete({ where: { id_instrutor: parseInt(id) } });
    res.json({ message: "Instrutor removido com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar instrutor." });
  }
};
