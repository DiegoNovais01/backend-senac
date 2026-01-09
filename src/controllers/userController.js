import prisma from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { validateEmail, validateString } from "../utils/validators.js";

const JWT_SECRET = process.env.JWT_SECRET || "senha_token";

// 🧍‍♂️ Registrar novo usuário
export const registrarUsuario = async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return ApiResponse.badRequest(res, emailValidation.error);
    }

    const nomeValidation = validateString(nome, { min: 3, max: 100 });
    if (!nomeValidation.valid) {
      return ApiResponse.badRequest(res, "Nome deve ter entre 3 e 100 caracteres");
    }

    const senhaValidation = validateString(senha, { min: 8 });
    if (!senhaValidation.valid) {
      return ApiResponse.badRequest(res, "Senha deve ter no mínimo 8 caracteres");
    }

    const senhaHash = await bcrypt.hash(senhaValidation.data, 10);

    const novoUsuario = await prisma.usuarios.create({
      data: { nome: nomeValidation.data, email: emailValidation.data, senha: senhaHash },
    });

    const { senha: _, ...usuarioSemSenha } = novoUsuario;
    logger.info("Usuário criado com sucesso", { id_usuario: novoUsuario.id_usuario });
    return ApiResponse.created(res, usuarioSemSenha, "Usuário criado com sucesso");
  } catch (err) {
    logger.error("Erro ao registrar usuário", { error: err.message });
    next(err);
  }
};

// 🔑 Login do usuário
export const loginUsuario = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return ApiResponse.badRequest(res, emailValidation.error);
    }

    const usuario = await prisma.usuarios.findUnique({ where: { email: emailValidation.data } });
    if (!usuario) {
      return ApiResponse.unauthorized(res, "Email ou senha incorretos");
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return ApiResponse.unauthorized(res, "Email ou senha incorretos");
    }

    const token = jwt.sign({ id: usuario.id_usuario, email: emailValidation.data }, JWT_SECRET, { expiresIn: "1h" });

    logger.info("Login realizado com sucesso", { id_usuario: usuario.id_usuario });
    return ApiResponse.success(res, { token }, "Login bem-sucedido");
  } catch (err) {
    logger.error("Erro ao fazer login", { error: err.message });
    next(err);
  }
};
