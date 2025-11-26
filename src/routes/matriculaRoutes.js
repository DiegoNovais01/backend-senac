import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { validateBody } from "../middlewares/validateBody.js";
import { matriculaSchema } from "../schemas/matriculaSchema.js";
import {
  listarMatriculas,
  criarMatricula,
  atualizarMatricula,
  deletarMatricula
} from "../controllers/matriculaController.js";

const router = express.Router();

router.get("/", authMiddleware, checkRole(['admin', 'secretaria']), listarMatriculas);
router.get("/:id", authMiddleware, checkRole(['admin', 'secretaria']), listarMatriculas);
router.post("/", authMiddleware, checkRole(['admin', 'secretaria']), validateBody(matriculaSchema), criarMatricula);
router.put("/:id", authMiddleware, checkRole(['admin', 'secretaria']), validateBody(matriculaSchema), atualizarMatricula);
router.delete("/:id", authMiddleware, checkRole(['admin', 'secretaria']), deletarMatricula);

export default router;
