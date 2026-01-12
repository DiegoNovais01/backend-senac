import express from "express";
import { validateBody } from "../middlewares/validateBody.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { validateIdParam } from "../middlewares/validateIdParam.js";
import avaliacaoSchema from "../schemas/avaliacaoSchema.js";
import {
  listarAvaliacoes,
  buscarAvaliacaoPorId,
  criarAvaliacao,
  atualizarAvaliacao,
  deletarAvaliacao
} from "../controllers/avaliacaoController.js";

const router = express.Router();

// Rotas públicas - apenas leitura
router.get("/", listarAvaliacoes);
router.get("/:id", validateIdParam, buscarAvaliacaoPorId);

// Rotas protegidas - requer autenticação E papel específico
router.post("/", authMiddleware, checkRole(['admin', 'professor']), validateBody(avaliacaoSchema), criarAvaliacao);
router.put("/:id", authMiddleware, checkRole(['admin', 'professor']), validateIdParam, validateBody(avaliacaoSchema), atualizarAvaliacao);
router.delete("/:id", authMiddleware, checkRole(['admin']), validateIdParam, deletarAvaliacao);

export default router;
