import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';

export const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const hash = await bcrypt.hash(senha, 10);

    const user = await prisma.usuarios.create({
      data: { nome, email, senha: hash },
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso', user });
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
