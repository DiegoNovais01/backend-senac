import express from "express";
import { login, register, refresh, logout } from "../controllers/authControllers.js";
import {
  listarUsuariosLogados,
  listarTodosUsuariosComCredenciais,
  solicitarRecuperacaoSenha,
  resetarSenha,
  mudarSenha,
  obterMeuPerfil,
  minhasSessoes,
  logoutDaSessao,
  logoutGlobal
} from "../controllers/usuarioManagementController.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  loginSchema,
  registerSchema,
  recuperarSenhaSchema,
  resetarSenhaSchema,
  mudarSenhaSchema
} from "../schemas/authSchema.js";

const router = express.Router();

// 🔐 Autenticação básica
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.post("/register", authLimiter, validateBody(registerSchema), register);
router.post("/refresh", validateBody({ parse: (data) => data }), refresh);
router.post("/logout", authMiddleware, logout);

// 🔑 Recuperação de Senha (protegida contra brute force)
router.post("/recuperar-senha", validateBody(recuperarSenhaSchema), solicitarRecuperacaoSenha);
// rota /resetar-senha removida por opção do projeto (recuperação via link enviado)
router.post("/mudar-senha", authMiddleware, validateBody(mudarSenhaSchema), mudarSenha);

// 👤 Perfil do Usuário Logado
router.get("/meu-perfil", authMiddleware, obterMeuPerfil);
router.get("/minhas-sessoes", authMiddleware, minhasSessoes);
router.post("/logout-sessao", authMiddleware, logoutDaSessao);
router.post("/logout-global", authMiddleware, logoutGlobal);

// 📋 Gerenciamento de Usuários (ADMIN ONLY - Protegido)
// ⚠️ AVISO: Endpoints sensíveis - Use apenas em ambiente seguro
router.get("/usuarios-logados", authMiddleware, checkRole(['admin']), listarUsuariosLogados);

// 🔴 ENDPOINT DEBUG - Removido em produção
// Descomente apenas em desenvolvimento se necessário
// router.get("/usuarios-debug", authMiddleware, checkRole(['admin']), listarTodosUsuariosComCredenciais);

export default router;
