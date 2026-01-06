import express from "express";
import { validateBody } from "../middlewares/validateBody.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import avaliacaoSchema from "../schemas/avaliacaoSchema.js";
import {
  listarAvaliacoes,
  buscarAvaliacaoPorId,
  criarAvaliacao,
  atualizarAvaliacao,
  deletarAvaliacao
} from "../controllers/avaliacaoController.js";

const router = express.Router();

// Middleware para validar ID
const validarId = (req, res, next) => {
  const id = req.params.id;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "ID inválido - deve ser um número" });
  }
  next();
};

// Rotas públicas - apenas leitura
router.get("/", listarAvaliacoes);
router.get("/:id", validarId, buscarAvaliacaoPorId);

// Rotas protegidas - requer autenticação E papel específico
router.post("/", authMiddleware, checkRole(['admin', 'professor']), validateBody(avaliacaoSchema), criarAvaliacao);
router.put("/:id", authMiddleware, checkRole(['admin', 'professor']), validarId, validateBody(avaliacaoSchema), atualizarAvaliacao);
router.delete("/:id", authMiddleware, checkRole(['admin']), validarId, deletarAvaliacao);

export default router;
