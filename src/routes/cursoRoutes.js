import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { validateBody } from "../middlewares/validateBody.js";
import { validateIdParam } from "../middlewares/validateIdParam.js";
import { cursoSchema } from "../schemas/cursoSchema.js";
import {
  listarCursos,
  buscarCursoPorId,
  criarCurso,
  atualizarCurso,
  deletarCurso
} from "../controllers/cursoController.js";

const router = express.Router();

// Rotas dos cursos protegidas
router.get("/", authMiddleware, checkRole(['admin', 'secretaria']), listarCursos);
router.get("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validateIdParam, buscarCursoPorId);
router.post("/", authMiddleware, checkRole(['admin', 'secretaria']), validateBody(cursoSchema), criarCurso);
router.put("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validateIdParam, validateBody(cursoSchema), atualizarCurso);
router.delete("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validateIdParam, deletarCurso);

export default router;
