import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./db.js";

import alunoRoutes from "./routes/alunoRoutes.js";
import cursoRoutes from "./routes/cursoRoutes.js";
import matriculaRoutes from "./routes/matriculaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import instrutorRoutes from "./routes/instrutorRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import avaliacaoRoutes from "./routes/avaliacaoRoutes.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import { errorHandler } from "./middlewares/errorHandle.js";
import cleanupRefreshTokens from './jobs/cleanupRefreshTokens.js';

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
app.use("/instrutores", instrutorRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/avaliacoes", avaliacaoRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware global de erro (deve vir após todas as rotas)
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("✅ API do SENAC está rodando! 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}\n🔗 http://localhost:3000\n📄 http://localhost:3000/api/docs`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("🧹 Prisma desconectado. Servidor encerrado.");
  process.exit(0);
});

// Inicia job de limpeza de refresh tokens: executa na inicialização e a cada 6 horas
(async () => {
  try {
    await cleanupRefreshTokens();
    setInterval(() => cleanupRefreshTokens(), 6 * 60 * 60 * 1000); // 6 horas
  } catch (err) {
    console.error('Erro ao iniciar cleanupRefreshTokens:', err);
  }
})();
