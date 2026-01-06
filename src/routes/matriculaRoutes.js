import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { validateBody } from "../middlewares/validateBody.js";
import { matriculaSchema } from "../schemas/matriculaSchema.js";
import {
  listarMatriculas,
  buscarMatriculaPorId,
  criarMatricula,
  atualizarMatricula,
  deletarMatricula
} from "../controllers/matriculaController.js";

const router = express.Router();

// Middleware para validar ID
const validarId = (req, res, next) => {
  const id = req.params.id;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "ID inválido - deve ser um número" });
  }
  next();
};

router.get("/", authMiddleware, checkRole(['admin', 'secretaria']), listarMatriculas);
router.get("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validarId, buscarMatriculaPorId);
router.post("/", authMiddleware, checkRole(['admin', 'secretaria']), validateBody(matriculaSchema), criarMatricula);
router.put("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validarId, validateBody(matriculaSchema), atualizarMatricula);
router.delete("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validarId, deletarMatricula);

export default router;
