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

const router = express.Router();

// 🔐 Autenticação básica
router.post("/login", authLimiter, login);
router.post("/register", register);
router.post("/refresh", refresh);
router.post("/logout", logout);

// 🔑 Recuperação de Senha
router.post("/recuperar-senha", solicitarRecuperacaoSenha);
router.post("/resetar-senha", resetarSenha);
router.post("/mudar-senha", authMiddleware, mudarSenha);

// 👤 Perfil do Usuário Logado
router.get("/meu-perfil", authMiddleware, obterMeuPerfil);
router.get("/minhas-sessoes", authMiddleware, minhasSessoes);
router.post("/logout-sessao", authMiddleware, logoutDaSessao);
router.post("/logout-global", authMiddleware, logoutGlobal);

// 📋 Gerenciamento de Usuários (ADMIN/DEBUG)
router.get("/usuarios-logados", authMiddleware, listarUsuariosLogados);
router.get("/usuarios-debug", listarTodosUsuariosComCredenciais); // ⚠️ Remove em produção!

export default router;
