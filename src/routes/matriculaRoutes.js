import express from "express";
import {
  listarMatriculas,
  criarMatricula,
  atualizarMatricula,
  deletarMatricula
} from "../controllers/matriculaController.js";

const router = express.Router();

router.get("/", listarMatriculas);
router.post("/", criarMatricula);
router.put("/:id", atualizarMatricula);
router.delete("/:id", deletarMatricula);

export default router;
