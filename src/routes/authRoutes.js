import express from "express";
import { login, register } from "../controllers/authControllers.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/register", register);

export default router;
