import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { validateBody } from "../middlewares/validateBody.js";
import { cursoSchema } from "../schemas/cursoSchema.js";
import {
  listarCursos,
  buscarCursoPorId,
  criarCurso,
  atualizarCurso,
  deletarCurso
} from "../controllers/cursoController.js";

const router = express.Router();

// Middleware para validar ID
const validarId = (req, res, next) => {
  const id = req.params.id;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "ID inválido - deve ser um número" });
  }
  next();
};

// Rotas dos cursos protegidas
router.get("/", authMiddleware, checkRole(['admin', 'secretaria']), listarCursos);
router.get("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validarId, buscarCursoPorId);
router.post("/", authMiddleware, checkRole(['admin', 'secretaria']), validateBody(cursoSchema), criarCurso);
router.put("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validarId, validateBody(cursoSchema), atualizarCurso);
router.delete("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validarId, deletarCurso);

export default router;
