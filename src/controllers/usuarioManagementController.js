import prisma from '../db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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

    res.json({
      total_usuarios: usuariosFormatados.length,
      usuarios_com_sessao: usuariosFormatados.filter(u => u.sessoes_ativas > 0).length,
      usuarios: usuariosFormatados
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar usuários logados' });
  }
};

/**
 * 📋 Listar APENAS usuários e suas credenciais (DEBUG - Remove em produção!)
 * ⚠️ CUIDADO: Retorna senhas com hash. Apenas para desenvolvimento!
 */
export const listarTodosUsuariosComCredenciais = async (req, res) => {
  try {
    console.warn('⚠️ Endpoint sensível acessado: listarTodosUsuariosComCredenciais');

    const usuarios = await prisma.usuarios.findMany({
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        papel: true,
        data_cadastro: true,
        // NOTA: senha não será retornada aqui por segurança, mas email está disponível
      },
      orderBy: { email: 'asc' }
    });

    res.json({
      aviso: 'Este endpoint retorna dados sensíveis. Não usar em produção!',
      total: usuarios.length,
      usuarios: usuarios
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

/**
 * 🔑 Recuperação de Senha - Parte 1: Solicitar reset
 * Gera um token de reset e envia email (simula com token na resposta em dev)
 */
export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const usuario = await prisma.usuarios.findUnique({ where: { email } });

    if (!usuario) {
      // Retorna sucesso mesmo se email não existe (segurança)
      return res.json({
        message: 'Se o email existe, um link de reset foi enviado',
        status: 'enviado'
      });
    }

    // Gera token de reset válido por 1 hora
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Salva hash do token no banco (seguro)
    // Nota: Você precisa adicionar estes campos à tabela usuarios
    // await prisma.usuarios.update({
    //   where: { id_usuario: usuario.id_usuario },
    //   data: { 
    //     reset_token: resetTokenHash,
    //     reset_token_expiry: resetTokenExpiry 
    //   }
    // });

    // Em desenvolvimento, retorna o token (em produção seria via email)
    const linkReset = `http://localhost:3000/auth/resetar-senha?token=${resetToken}&email=${usuario.email}`;

    console.log('🔑 Link de recuperação gerado:');
    console.log(linkReset);

    res.json({
      message: 'Email de recuperação enviado (em produção)',
      dev_link: process.env.NODE_ENV === 'development' ? linkReset : undefined,
      // Retorna apenas confirmação sem expor detalhes
      status: 'enviado'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao solicitar recuperação de senha' });
  }
};

/**
 * 🔑 Recuperação de Senha - Parte 2: Resetar com token
 */
export const resetarSenha = async (req, res) => {
  try {
    const { email, token, nova_senha } = req.body;

    if (!email || !token || !nova_senha) {
      return res.status(400).json({
        error: 'Email, token e nova_senha são obrigatórios'
      });
    }

    if (nova_senha.length < 6) {
      return res.status(400).json({
        error: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    const usuario = await prisma.usuarios.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    // Aqui você validaria o token
    // const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    // if (usuario.reset_token !== tokenHash || usuario.reset_token_expiry < new Date()) {
    //   return res.status(400).json({ error: 'Token inválido ou expirado' });
    // }

    // Hash a nova senha
    const novoHash = await bcrypt.hash(nova_senha, 10);

    // Atualiza a senha
    await prisma.usuarios.update({
      where: { id_usuario: usuario.id_usuario },
      data: {
        senha: novoHash,
        // reset_token: null,
        // reset_token_expiry: null
      }
    });

    res.json({
      message: 'Senha atualizada com sucesso!',
      status: 'sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao resetar senha' });
  }
};

/**
 * 🔄 Mudar Senha - Usuário logado muda sua própria senha
 */
export const mudarSenha = async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    const userId = req.user.id; // Do token JWT

    if (!senha_atual || !nova_senha) {
      return res.status(400).json({
        error: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (nova_senha.length < 6) {
      return res.status(400).json({
        error: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    if (senha_atual === nova_senha) {
      return res.status(400).json({
        error: 'Nova senha não pode ser igual à atual'
      });
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { id_usuario: userId }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Valida senha atual
    const senhaCorreta = await bcrypt.compare(senha_atual, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Hash nova senha
    const novoHash = await bcrypt.hash(nova_senha, 10);

    // Atualiza
    await prisma.usuarios.update({
      where: { id_usuario: userId },
      data: { senha: novoHash }
    });

    res.json({
      message: 'Senha alterada com sucesso!',
      status: 'sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao mudar senha' });
  }
};

/**
 * 🧑‍💼 Visualizar dados do usuário logado
 */
export const obterMeuPerfil = async (req, res) => {
  try {
    const userId = req.user.id;

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
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      perfil: usuario,
      message: 'Dados do perfil carregados com sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter perfil' });
  }
};

/**
 * 🔐 Listar todas as sessões ativas do usuário logado
 */
export const minhasSessoes = async (req, res) => {
  try {
    const userId = req.user.id;

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

    res.json({
      total_sessoes: sessoesFormatadas.length,
      sessoes: sessoesFormatadas
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar sessões' });
  }
};

/**
 * 🔓 Fazer logout de uma sessão específica
 */
export const logoutDaSessao = async (req, res) => {
  try {
    const { sessao_id } = req.body;
    const userId = req.user.id;

    if (!sessao_id) {
      return res.status(400).json({ error: 'sessao_id é obrigatório' });
    }

    const sessao = await prisma.refresh_tokens.findUnique({
      where: { id: parseInt(sessao_id) }
    });

    if (!sessao || sessao.id_usuario !== userId) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.refresh_tokens.update({
      where: { id: parseInt(sessao_id) },
      data: { revoked: true }
    });

    res.json({
      message: 'Sessão encerrada com sucesso',
      status: 'sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao encerrar sessão' });
  }
};

/**
 * 🔐 Logout de todas as sessões (logout global)
 */
export const logoutGlobal = async (req, res) => {
  try {
    const userId = req.user.id;

    const resultado = await prisma.refresh_tokens.updateMany({
      where: {
        id_usuario: userId,
        revoked: false
      },
      data: { revoked: true }
    });

    res.json({
      message: 'Logout de todas as sessões realizado com sucesso',
      sessoes_encerradas: resultado.count,
      status: 'sucesso'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer logout global' });
  }
};