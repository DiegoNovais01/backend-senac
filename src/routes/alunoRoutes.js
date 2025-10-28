import express from "express";
import { validateBody } from "../middlewares/validateBody.js";
import { alunoSchema } from "../schemas/alunoSchema.js";
import {
  listarAlunos,
  buscarAlunoPorId,
  criarAluno,
  atualizarAluno,
  deletarAluno
} from "../controllers/alunoController.js";

const router = express.Router();

router.get("/", listarAlunos);
router.get("/:id", buscarAlunoPorId);
router.post("/", validateBody(alunoSchema), criarAluno);
router.put("/:id", validateBody(alunoSchema), atualizarAluno);
router.delete("/:id", deletarAluno);

export default router;
