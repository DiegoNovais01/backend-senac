import prisma from '../db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { validators } from '../utils/validators.js';

/**
 * 📋 Listar todos os usuários com tokens ativos (ADMIN ONLY)
 * Retorna email, nome, papel e informações de sessão ativa
 */
export const listarUsuariosLogados = async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        papel: true,
        data_cadastro: true,
        refreshTokens: {
          where: { revoked: false },
          select: {
            id: true,
            created_at: true,
            expires_at: true
          }
        }
      },
      orderBy: { data_cadastro: 'desc' }
    });

    // Formata resposta com informações úteis
    const usuariosFormatados = usuarios.map(user => ({
      id_usuario: user.id_usuario,
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      data_cadastro: user.data_cadastro,
      sessoes_ativas: user.refreshTokens.length,
      ultima_sessao: user.refreshTokens.length > 0
        ? new Date(Math.max(...user.refreshTokens.map(t => new Date(t.created_at))))
        : null,
      tokens: user.refreshTokens.map(t => ({
        criado_em: t.created_at,
        expira_em: t.expires_at,
        dias_restantes: Math.ceil((new Date(t.expires_at) - new Date()) / (1000 * 60 * 60 * 24))
      }))
    }));

    logger.info("Usuários logados listados com sucesso", { total: usuariosFormatados.length });
    return ApiResponse.success(res, {
      total_usuarios: usuariosFormatados.length,
      usuarios_com_sessao: usuariosFormatados.filter(u => u.sessoes_ativas > 0).length,
      usuarios: usuariosFormatados
    }, "Usuários logados recuperados com sucesso");
  } catch (error) {
    logger.error("Erro ao listar usuários logados", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao listar usuários logados");
  }
};

/**
 * 📋 Listar APENAS usuários e suas credenciais (DEBUG - Remove em produção!)
 * ⚠️ CUIDADO: Retorna senhas com hash. Apenas para desenvolvimento!
 */
export const listarTodosUsuariosComCredenciais = async (req, res) => {
  try {
    logger.warn("Endpoint sensível acessado: listarTodosUsuariosComCredenciais");

    const usuarios = await prisma.usuarios.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        papel: true,
        data_cadastro: true,
      },
      orderBy: { email: 'asc' }
    });

    return ApiResponse.success(res, {
      aviso: 'Este endpoint retorna dados sensíveis. Não usar em produção!',
      total: usuarios.length,
      usuarios: usuarios
    }, "Usuários listados (endpoint sensível)");
  } catch (error) {
    logger.error("Erro ao listar usuários com credenciais", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao listar usuários");
  }
};

/**
 * 🔑 Recuperação de Senha - Parte 1: Solicitar reset
 * Gera um token de reset e envia email (simula com token na resposta em dev)
 */
export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;

    const emailValidation = validators.validateEmail(email);
    if (!emailValidation.valid) {
      return ApiResponse.badRequest(res, emailValidation.error);
    }

    const usuario = await prisma.usuarios.findUnique({ where: { email: emailValidation.data } });

    if (!usuario) {
      // Retorna sucesso mesmo se email não existe (segurança)
      return ApiResponse.success(res, { status: 'enviado' }, "Se o email existe, um link de reset foi enviado");
    }

    // Gera token de reset válido por 1 hora
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Em desenvolvimento, retorna o token (em produção seria via email)
    const linkReset = `http://localhost:3000/auth/resetar-senha?token=${resetToken}&email=${usuario.email}`;

    logger.info("Link de recuperação gerado", { email: emailValidation.data });

    return ApiResponse.success(res, {
      status: 'enviado',
      dev_link: process.env.NODE_ENV === 'development' ? linkReset : undefined
    }, "Email de recuperação enviado (em produção)");
  } catch (error) {
    logger.error("Erro ao solicitar recuperação de senha", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao solicitar recuperação de senha");
  }
};

/**
 * 🔑 Recuperação de Senha - Parte 2: Resetar com token
 */
export const resetarSenha = async (req, res) => {
  try {
    const { email, token, nova_senha } = req.body;

    const emailValidation = validators.validateEmail(email);
    if (!emailValidation.valid) {
      return ApiResponse.badRequest(res, emailValidation.error);
    }

    const senhaValidation = validators.validateString(nova_senha, { min: 8 });
    if (!senhaValidation.valid) {
      return ApiResponse.badRequest(res, "Senha deve ter no mínimo 8 caracteres");
    }

    if (!token) {
      return ApiResponse.badRequest(res, "Token é obrigatório");
    }

    const usuario = await prisma.usuarios.findUnique({ where: { email: emailValidation.data } });

    if (!usuario) {
      return ApiResponse.notFound(res, "Usuário não encontrado");
    }

    // Hash a nova senha
    const novoHash = await bcrypt.hash(senhaValidation.data, 10);

    // Atualiza a senha
    await prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: { senha: novoHash }
    });

    logger.info("Senha resetada com sucesso", { id_usuario: usuario.id_usuario });
    return ApiResponse.success(res, { status: 'sucesso' }, "Senha atualizada com sucesso");
  } catch (error) {
    logger.error("Erro ao resetar senha", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao resetar senha");
  }
};

/**
 * 🔄 Mudar Senha - Usuário logado muda sua própria senha
 */
export const mudarSenha = async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.unauthorized(res, "Usuário não autenticado");
    }

    const senhaAtualValidation = validators.validateString(senha_atual, { min: 8 });
    const novaSenhaValidation = validators.validateString(nova_senha, { min: 8 });

    if (!senhaAtualValidation.valid || !novaSenhaValidation.valid) {
      return ApiResponse.badRequest(res, "Senhas devem ter no mínimo 8 caracteres");
    }

    if (senha_atual === nova_senha) {
      return ApiResponse.badRequest(res, "Nova senha não pode ser igual à atual");
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: userId }
    });

    if (!usuario) {
      return ApiResponse.notFound(res, "Usuário não encontrado");
    }

    // Valida senha atual
    const senhaCorreta = await bcrypt.compare(senhaAtualValidation.data, usuario.senha);
    if (!senhaCorreta) {
      return ApiResponse.unauthorized(res, "Senha atual incorreta");
    }

    // Hash nova senha
    const novoHash = await bcrypt.hash(novaSenhaValidation.data, 10);

    // Atualiza
    await prisma.usuarios.update({
      where: { id_usuario: userId },
      data: { senha: novoHash }
    });

    logger.info("Senha alterada com sucesso", { id_usuario: userId });
    return ApiResponse.success(res, { status: 'sucesso' }, "Senha alterada com sucesso");
  } catch (error) {
    logger.error("Erro ao mudar senha", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao mudar senha");
  }
};

/**
 * 🧑‍💼 Visualizar dados do usuário logado
 */
export const obterMeuPerfil = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.unauthorized(res, "Usuário não autenticado");
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: userId },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        papel: true,
        cpf: true,
        data_cadastro: true
      }
    });

    if (!usuario) {
      return ApiResponse.notFound(res, "Usuário não encontrado");
    }

    logger.info("Perfil carregado", { id_usuario: userId });
    return ApiResponse.success(res, { perfil: usuario }, "Dados do perfil carregados com sucesso");
  } catch (error) {
    logger.error("Erro ao obter perfil", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao obter perfil");
  }
};

/**
 * 🔐 Listar todas as sessões ativas do usuário logado
 */
export const minhasSessoes = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.unauthorized(res, "Usuário não autenticado");
    }

    const sessoes = await prisma.refresh_tokens.findMany({
      where: {
        id_usuario: userId,
        revoked: false
      },
      select: {
        id: true,
        created_at: true,
        expires_at: true
      },
      orderBy: { created_at: 'desc' }
    });

    const sessoesFormatadas = sessoes.map(s => ({
      id: s.id,
      criada_em: s.created_at,
      expira_em: s.expires_at,
      dias_restantes: Math.ceil((new Date(s.expires_at) - new Date()) / (1000 * 60 * 60 * 24)),
      ativa: new Date(s.expires_at) > new Date()
    }));

    logger.info("Sessões do usuário listadas", { id_usuario: userId, total: sessoesFormatadas.length });
    return ApiResponse.success(res, {
      total_sessoes: sessoesFormatadas.length,
      sessoes: sessoesFormatadas
    }, "Sessões recuperadas com sucesso");
  } catch (error) {
    logger.error("Erro ao listar sessões", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao listar sessões");
  }
};

/**
 * 🔓 Fazer logout de uma sessão específica
 */
export const logoutDaSessao = async (req, res) => {
  try {
    const { sessao_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.unauthorized(res, "Usuário não autenticado");
    }

    if (!sessao_id) {
      return ApiResponse.badRequest(res, "sessao_id é obrigatório");
    }

    const sessaoIdValidation = validators.validateId(sessao_id);
    if (!sessaoIdValidation.valid) {
      return ApiResponse.badRequest(res, "sessao_id inválido");
    }

    const sessao = await prisma.refresh_tokens.findUnique({
      where: { id: sessaoIdValidation.data }
    });

    if (!sessao || sessao.id_usuario !== userId) {
      return ApiResponse.forbidden(res, "Acesso negado");
    }

    await prisma.refresh_tokens.update({
      where: { id: sessaoIdValidation.data },
      data: { revoked: true }
    });

    logger.info("Sessão encerrada com sucesso", { id_usuario: userId, sessao_id: sessaoIdValidation.data });
    return ApiResponse.success(res, { status: 'sucesso' }, "Sessão encerrada com sucesso");
  } catch (error) {
    logger.error("Erro ao encerrar sessão", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao encerrar sessão");
  }
};

/**
 * 🔐 Logout de todas as sessões (logout global)
 */
export const logoutGlobal = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.unauthorized(res, "Usuário não autenticado");
    }

    const resultado = await prisma.refresh_tokens.updateMany({
      where: {
        id_usuario: userId,
        revoked: false
      },
      data: { revoked: true }
    });

    logger.info("Logout global realizado com sucesso", { id_usuario: userId, sessoes_encerradas: resultado.count });
    return ApiResponse.success(res, {
      sessoes_encerradas: resultado.count,
      status: 'sucesso'
    }, "Logout de todas as sessões realizado com sucesso");
  } catch (error) {
    logger.error("Erro ao fazer logout global", { error: error.message });
    return ApiResponse.serverError(res, "Erro ao fazer logout global");
  }
};

