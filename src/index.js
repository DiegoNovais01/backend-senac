import express from "express";
import dotenv from "dotenv";
import prisma from "./db.js";

import alunoRoutes from "./routes/alunoRoutes.js";
import cursoRoutes from "./routes/cursoRoutes.js";
import matriculaRoutes from "./routes/matriculaRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/alunos", alunoRoutes);
app.use("/api/cursos", cursoRoutes);
app.use("/api/matriculas", matriculaRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("✅ API do SENAC está rodando! 🚀");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("🧹 Prisma desconectado. Servidor encerrado.");
  process.exit(0);
});
