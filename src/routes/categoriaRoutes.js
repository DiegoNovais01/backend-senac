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

// Rotas públicas - apenas leitura
router.get("/", listarCategorias);
router.get("/:id", buscarCategoriaPorId);

// Rotas protegidas - requer autenticação E papel específico
router.post("/", authMiddleware, checkRole(['admin']), validateBody(categoriaSchema), criarCategoria);
router.put("/:id", authMiddleware, checkRole(['admin']), validateBody(categoriaSchema), atualizarCategoria);
router.delete("/:id", authMiddleware, checkRole(['admin']), deletarCategoria);

export default router;
