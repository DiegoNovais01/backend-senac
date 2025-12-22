import express from "express";
import { registrarUsuario, loginUsuario } from "../controllers/userController.js";
import { validateBody } from "../middlewares/validateBody.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";

const router = express.Router();

router.post("/register", validateBody(registerSchema), registrarUsuario);
router.post("/login", validateBody(loginSchema), loginUsuario);

export default router;
