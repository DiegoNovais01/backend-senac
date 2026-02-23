import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import crypto from 'crypto';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { validateEmail, validateString } from '../utils/validators.js';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL_DAYS = process.env.REFRESH_TOKEN_TTL_DAYS ? parseInt(process.env.REFRESH_TOKEN_TTL_DAYS, 10) : 7;

export const register = async (req, res) => {
  try {
    const { nome, email, senha, papel = 'aluno' } = req.body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return ApiResponse.badRequest(res, emailValidation.error);
    }

    const nomeValidation = validateString(nome, { min: 3, max: 100 });
    if (!nomeValidation.valid) {
      return ApiResponse.badRequest(res, "Nome deve ter entre 3 e 100 caracteres");
    }

    const senhaValidation = validateString(senha, { min: 8, max: 255 });
    if (!senhaValidation.valid) {
      return ApiResponse.badRequest(res, "Senha deve ter entre 8 e 255 caracteres");
    }

    // Verifica se email já existe
    const existente = await prisma.usuarios.findUnique({ where: { email: emailValidation.value } });
    if (existente) {
      return ApiResponse.conflict(res, "Email já cadastrado");
    }

    // Valida papel
    const papeisValidos = ['admin', 'professor', 'aluno', 'secretaria'];
    if (!papeisValidos.includes(papel)) {
      return ApiResponse.badRequest(res, `Papel inválido. Papéis permitidos: ${papeisValidos.join(', ')}`);
    }

    // Verificar CPF único entre tabelas (se fornecido)
    if (req.body.cpf) {
      const cpf = req.body.cpf;
      const existsAluno = await prisma.alunos.findUnique({ where: { cpf } });
      const existsInstrutor = await prisma.instrutores.findUnique({ where: { cpf } });
      const existsUsuario = await prisma.usuarios.findUnique({ where: { cpf } });
      if (existsAluno || existsInstrutor || existsUsuario) {
        return ApiResponse.conflict(res, "CPF já cadastrado em outro registro");
      }
    }

    const hash = await bcrypt.hash(senhaValidation.value, 10);

    const user = await prisma.usuarios.create({
      data: {
        nome: nomeValidation.value,
        email: emailValidation.value,
        senha: hash,
        papel
      },
    });

    // Remove senha do retorno
    const { senha: _, ...userSemSenha } = user;

    // Gerar access + refresh token no registro
    const accessToken = jwt.sign(
      { id: user.id_usuario, papel: user.papel },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refresh_tokens.create({ data: { token: refreshHash, id_usuario: user.id_usuario, expires_at: expiresAt } });

    logger.info("Usuário registrado com sucesso", { id_usuario: user.id_usuario, email: emailValidation.value });
    return ApiResponse.created(res, { user: userSemSenha, token: accessToken, refreshToken });
  } catch (error) {
    logger.error("Erro ao registrar usuário", { error: error.message, body: req.body });
    return ApiResponse.serverError(res, "Erro ao registrar usuário");
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return ApiResponse.badRequest(res, emailValidation.error);
    }

    const user = await prisma.usuarios.findUnique({ where: { email: emailValidation.value } });
    if (!user) {
      return ApiResponse.unauthorized(res, "Email ou senha incorretos");
    }

    const match = await bcrypt.compare(senha, user.senha);
    if (!match) {
      return ApiResponse.unauthorized(res, "Email ou senha incorretos");
    }

    const accessToken = jwt.sign(
      { id: user.id_usuario, papel: user.papel },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    // Criar refresh token e salvar no banco (hash)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refresh_tokens.create({ data: { token: refreshHash, id_usuario: user.id_usuario, expires_at: expiresAt } });

    logger.info("Login realizado com sucesso", { id_usuario: user.id_usuario, email: emailValidation.value });
    return ApiResponse.success(res, { token: accessToken, refreshToken }, "Login realizado com sucesso", 200);
  } catch (error) {
    logger.error("Erro ao fazer login", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao fazer login");
  }
};

export const refresh = async (req, res) => {
  try {
    // Aceita o refresh token via json body (refreshToken, refresh_token) ou header x-refresh-token
    const refreshToken = req.body?.refreshToken || req.body?.refresh_token || req.headers['x-refresh-token'] || req.query?.refreshToken || req.query?.refresh_token;

    if (!refreshToken) {
      logger.warn("Refresh token não fornecido", { body: !!req.body, headers: !!req.headers });
      return ApiResponse.badRequest(res, "refreshToken não fornecido");
    }

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await prisma.refresh_tokens.findFirst({ where: { token: refreshHash, revoked: false } });
    if (!stored) {
      return ApiResponse.unauthorized(res, "Refresh token inválido");
    }
    if (stored.expires_at <= new Date()) {
      return ApiResponse.unauthorized(res, "Refresh token expirado");
    }

    const user = await prisma.usuarios.findUnique({ where: { id_usuario: stored.id_usuario } });
    if (!user) {
      return ApiResponse.unauthorized(res, "Usuário do refresh token não encontrado");
    }

    // Criar novo access token
    const accessToken = jwt.sign({ id: user.id_usuario, papel: user.papel }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });

    // Rotacionar refresh token: gerar novo e atualizar o registro
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refresh_tokens.update({ where: { id: stored.id }, data: { token: newHash, expires_at: newExpiresAt } });

    logger.info("Token renovado com sucesso", { id_usuario: user.id_usuario });
    return ApiResponse.success(res, { token: accessToken, refreshToken: newRefreshToken }, "Token renovado com sucesso", 200);
  } catch (err) {
    logger.error("Erro ao renovar token", { error: err.message });
    return ApiResponse.serverError(res, "Erro ao renovar token");
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken || req.body?.refresh_token || req.headers['x-refresh-token'] || req.query?.refreshToken || req.query?.refresh_token;

    if (!refreshToken) {
      logger.warn("Logout sem refresh token fornecido");
      return ApiResponse.badRequest(res, "refreshToken não fornecido");
    }
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await prisma.refresh_tokens.findFirst({ where: { token: refreshHash } });
    if (!stored) {
      return ApiResponse.success(res, null, "Logout realizado (token inválido ou já removido)", 200);
    }
    await prisma.refresh_tokens.update({ where: { id: stored.id }, data: { revoked: true } });
    logger.info("Logout realizado com sucesso", { id_usuario: stored.id_usuario });
    return ApiResponse.success(res, null, "Logout realizado com sucesso", 200);
  } catch (err) {
    logger.error("Erro ao fazer logout", { error: err.message });
    return ApiResponse.serverError(res, "Erro ao fazer logout");
  }
};
