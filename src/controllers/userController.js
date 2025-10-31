import prisma from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "senha_token";

// 🧍‍♂️ Registrar novo usuário
export const registrarUsuario = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await prisma.usuarios.create({
      data: { nome, email, senha: senhaHash },
    });

    res.status(201).json({ message: "Usuário criado com sucesso!", usuario: novoUsuario });
  } catch (err) {
    next(err);
  }
};

// 🔑 Login do usuário
export const loginUsuario = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    const usuario = await prisma.usuarios.findUnique({ where: { email } });
    if (!usuario) return res.status(401).json({ error: "Usuário não encontrado" });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign({ id: usuario.id, email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login bem-sucedido", token });
  } catch (err) {
    next(err);
  }
};
