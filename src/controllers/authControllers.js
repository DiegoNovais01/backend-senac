import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';

export const register = async (req, res) => {
  try {
    const { nome, email, senha, papel = 'aluno' } = req.body;

    // Verifica se email já existe
    const existente = await prisma.usuarios.findUnique({ where: { email } });
    if (existente) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Valida papel
    const papeisValidos = ['admin', 'professor', 'aluno', 'secretaria'];
    if (!papeisValidos.includes(papel)) {
      return res.status(400).json({
        error: 'Papel inválido',
        papeis_permitidos: papeisValidos
      });
    }

    // Verificar CPF único entre tabelas (se fornecido)
    if (req.body.cpf) {
      const cpf = req.body.cpf;
      const existsAluno = await prisma.alunos.findUnique({ where: { cpf } });
      const existsInstrutor = await prisma.instrutores.findUnique({ where: { cpf } });
      const existsUsuario = await prisma.usuarios.findUnique({ where: { cpf } });
      if (existsAluno || existsInstrutor || existsUsuario) {
        return res.status(400).json({ error: 'CPF já cadastrado em outro registro' });
      }
    }

    const hash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: hash,
        papel // será convertido para enum pelo Prisma
      },
    });

    // Remove senha do retorno
    const { senha: _, ...userSemSenha } = user;
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: userSemSenha
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await prisma.usuarios.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign(
      { id: user.id_usuario, papel: user.papel },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login realizado com sucesso', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
