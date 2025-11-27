import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./db.js";

import alunoRoutes from "./routes/alunoRoutes.js";
import cursoRoutes from "./routes/cursoRoutes.js";
import matriculaRoutes from "./routes/matriculaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import { errorHandler } from "./middlewares/errorHandle.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

import { createApiLimiter } from "./middlewares/rateLimit.js";

const apiLimiter = createApiLimiter({ windowMs: 15 * 60 * 1000, max: 250 })
app.use(apiLimiter)

app.set("trust proxy", 1)

app.use("/alunos", alunoRoutes);
app.use("/cursos", cursoRoutes);
app.use("/matriculas", matriculaRoutes);
app.use("/auth", authRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware global de erro (deve vir após todas as rotas)
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("✅ API do SENAC está rodando! 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}\n🔗 http://localhost:3000`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("🧹 Prisma desconectado. Servidor encerrado.");
  process.exit(0);
});
