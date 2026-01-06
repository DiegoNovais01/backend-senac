import express from "express";
import { validateBody } from "../middlewares/validateBody.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { alunoSchema } from "../schemas/alunoSchema.js";
import {
  listarAlunos,
  buscarAlunoPorId,
  criarAluno,
  atualizarAluno,
  deletarAluno
} from "../controllers/alunoController.js";

const router = express.Router();

// Middleware para validar ID
const validarId = (req, res, next) => {
  const id = req.params.id;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "ID inválido - deve ser um número" });
  }
  next();
};

// Rotas protegidas - requer autenticação E papel específico
router.get("/", authMiddleware, checkRole(['admin', 'secretaria']), listarAlunos);
router.get("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validarId, buscarAlunoPorId);
router.post("/", authMiddleware, checkRole(['admin', 'secretaria']), validateBody(alunoSchema), criarAluno);
router.put("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validarId, validateBody(alunoSchema), atualizarAluno);
router.delete("/:id", authMiddleware, checkRole(['admin']), validarId, deletarAluno);

export default router;
