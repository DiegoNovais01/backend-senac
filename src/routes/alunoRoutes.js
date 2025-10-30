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

// Rotas públicas (sem proteção)
router.get("/:id", buscarAlunoPorId);

// Rotas protegidas - requer autenticação E papel específico
router.get("/", authMiddleware, checkRole(['admin', 'secretaria']), listarAlunos);
router.post("/", authMiddleware, checkRole(['admin', 'secretaria']), validateBody(alunoSchema), criarAluno);
router.put("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validateBody(alunoSchema), atualizarAluno);
router.delete("/:id", authMiddleware, checkRole(['admin']), deletarAluno);

export default router;
