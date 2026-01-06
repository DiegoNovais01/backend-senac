import express from "express";
import { validateBody } from "../middlewares/validateBody.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import instrutorSchema from "../schemas/instrutorSchema.js";
import {
  listarInstrutores,
  buscarInstrutorPorId,
  criarInstrutor,
  atualizarInstrutor,
  deletarInstrutor
} from "../controllers/instrutorController.js";

const router = express.Router();

// Middleware para validar ID
const validarId = (req, res, next) => {
  const id = req.params.id;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "ID inválido - deve ser um número" });
  }
  next()
};

// Rotas protegidas - requer autenticação E papel específico
router.get("/", authMiddleware, checkRole(['admin', 'secretaria']), listarInstrutores);
router.get("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validarId, buscarInstrutorPorId);
router.post("/", authMiddleware, checkRole(['admin']), validateBody(instrutorSchema), criarInstrutor);
router.put("/:id", authMiddleware, checkRole(['admin']), validarId, validateBody(instrutorSchema), atualizarInstrutor);
router.delete("/:id", authMiddleware, checkRole(['admin']), validarId, deletarInstrutor);

export default router;
