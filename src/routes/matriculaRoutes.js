import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import {
  listarMatriculas,
  criarMatricula,
  atualizarMatricula,
  deletarMatricula
} from "../controllers/matriculaController.js";

const router = express.Router();

router.get("/", authMiddleware, checkRole(['admin', 'secretaria']), listarMatriculas);
router.get("/:id", authMiddleware, checkRole(['admin', 'secretaria']), listarMatriculas);
router.post("/", authMiddleware, checkRole(['admin', 'secretaria']), criarMatricula);
router.put("/:id", authMiddleware, checkRole(['admin', 'secretaria']), atualizarMatricula);
router.delete("/:id", authMiddleware, checkRole(['admin', 'secretaria']), deletarMatricula);

export default router;
