import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL_DAYS = process.env.REFRESH_TOKEN_TTL_DAYS ? parseInt(process.env.REFRESH_TOKEN_TTL_DAYS, 10) : 7;

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

    // Gerar access + refresh token no registro (opcional - login automático)
    const accessToken = jwt.sign(
      { id: user.id_usuario, papel: user.papel },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refresh_tokens.create({ data: { token: refreshHash, id_usuario: user.id_usuario, expires_at: expiresAt } });

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: userSemSenha,
      token: accessToken,
      refreshToken
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

    const accessToken = jwt.sign(
      { id: user.id_usuario, papel: user.papel },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    // Criar refresh token e salvar no banco (hash)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refresh_tokens.create({ data: { token: refreshHash, id_usuario: user.id_usuario, expires_at: expiresAt } });

    res.json({ message: 'Login realizado com sucesso', token: accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    // Aceita o refresh token via json body (refreshToken, refresh_token), header x-refresh-token, Authorization Bearer, ou query
    const refreshToken = req.body?.refreshToken || req.body?.refresh_token || req.headers['x-refresh-token'] || (req.headers.authorization?.split(' ')[1]) || req.query?.refreshToken || req.query?.refresh_token;

    if (!refreshToken) {
      console.warn('refresh: nenhum refreshToken fornecido; body=', req.body, 'headers=', { auth: req.headers.authorization, x: req.headers['x-refresh-token'] }, 'query=', req.query);
      return res.status(400).json({ error: 'refreshToken não fornecido' });
    }

    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await prisma.refresh_tokens.findFirst({ where: { token: refreshHash, revoked: false } });
    if (!stored) return res.status(401).json({ error: 'Refresh token inválido' });
    if (stored.expires_at <= new Date()) return res.status(401).json({ error: 'Refresh token expirado' });

    const user = await prisma.usuarios.findUnique({ where: { id_usuario: stored.id_usuario } });
    if (!user) return res.status(401).json({ error: 'Usuário do refresh token não encontrado' });

    // Criar novo access token
    const accessToken = jwt.sign({ id: user.id_usuario, papel: user.papel }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });

    // Rotacionar refresh token: gerar novo e atualizar o registro
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
    await prisma.refresh_tokens.update({ where: { id: stored.id }, data: { token: newHash, expires_at: newExpiresAt } });

    res.json({ token: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao renovar token' });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken || req.body?.refresh_token || req.headers['x-refresh-token'] || (req.headers.authorization?.split(' ')[1]) || req.query?.refreshToken || req.query?.refresh_token;

    if (!refreshToken) {
      console.warn('logout: nenhum refreshToken fornecido; body=', req.body, 'headers=', { auth: req.headers.authorization, x: req.headers['x-refresh-token'] }, 'query=', req.query);
      return res.status(400).json({ error: 'refreshToken não fornecido' });
    }
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const stored = await prisma.refresh_tokens.findFirst({ where: { token: refreshHash } });
    if (!stored) return res.status(200).json({ message: 'Logout realizado (token inválido ou já removido)' });
    await prisma.refresh_tokens.update({ where: { id: stored.id }, data: { revoked: true } });
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
};
