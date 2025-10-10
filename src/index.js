import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cursoRoutes from "./routes/cursoRoutes.js";
import alunoRoutes from "./routes/alunoRoutes.js";
import matriculaRoutes from "./routes/matriculaRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/cursos", cursoRoutes);
app.use("/alunos", alunoRoutes);
app.use("/matriculas", matriculaRoutes);

app.get("/", (req, res) => {
  res.send("🌐 API do Senac Cursos funcionando!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}\n🔗 http://localhost:3000`));
