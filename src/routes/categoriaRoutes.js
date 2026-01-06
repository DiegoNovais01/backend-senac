import express from "express";
import { validateBody } from "../middlewares/validateBody.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import categoriaSchema from "../schemas/categoriaSchema.js";
import {
  listarCategorias,
  buscarCategoriaPorId,
  criarCategoria,
  atualizarCategoria,
  deletarCategoria
} from "../controllers/categoriaController.js";

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
router.get("/", listarCategorias);
router.get("/:id", validarId, buscarCategoriaPorId);

// Rotas protegidas - requer autenticação E papel específico
router.post("/", authMiddleware, checkRole(['admin']), validateBody(categoriaSchema), criarCategoria);
router.put("/:id", authMiddleware, checkRole(['admin']), validarId, validateBody(categoriaSchema), atualizarCategoria);
router.delete("/:id", authMiddleware, checkRole(['admin']), validarId, deletarCategoria);

export default router;
