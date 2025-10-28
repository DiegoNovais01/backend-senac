import express from "express";
import {
  listarCursos,
  buscarCursoPorId,
  criarCurso,
  atualizarCurso,
  deletarCurso
} from "../controllers/cursoController.js";

const router = express.Router();

router.get("/", listarCursos);
router.get("/:id", buscarCursoPorId);
router.post("/", criarCurso);
router.put("/:id", atualizarCurso);
router.delete("/:id", deletarCurso);

export default router;
