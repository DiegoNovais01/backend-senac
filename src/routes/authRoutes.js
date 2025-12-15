import express from "express";
import { login, register, refresh, logout } from "../controllers/authControllers.js";
import { authLimiter } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/login", authLimiter, login);
router.post("/register", register);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
