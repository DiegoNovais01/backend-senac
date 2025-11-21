import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
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
router.get("/:id", authMiddleware, checkRole(['admin', 'secretaria']), buscarCursoPorId);
router.post("/", authMiddleware, checkRole(['admin', 'secretaria']), criarCurso);
router.put("/:id", authMiddleware, checkRole(['admin', 'secretaria']), atualizarCurso);
router.delete("/:id", authMiddleware, checkRole(['admin', 'secretaria']), deletarCurso);

export default router;
