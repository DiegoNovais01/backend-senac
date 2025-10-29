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

app.use("/alunos", alunoRoutes);
app.use("/cursos", cursoRoutes);
app.use("/matriculas", matriculaRoutes);
app.use("/auth", authRoutes);

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
