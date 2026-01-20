import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./db.js";

// Importar rotas
import alunoRoutes from "./routes/alunoRoutes.js";
import cursoRoutes from "./routes/cursoRoutes.js";
import matriculaRoutes from "./routes/matriculaRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import instrutorRoutes from "./routes/instrutorRoutes.js";
import categoriaRoutes from "./routes/categoriaRoutes.js";
import avaliacaoRoutes from "./routes/avaliacaoRoutes.js";

// Importar middlewares
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import { errorHandler } from "./middlewares/errorHandle.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { createApiLimiter, readLimiter as defaultReadLimiter, writeLimiter as defaultWriteLimiter } from "./middlewares/rateLimit.js";
import { sanitizeInputs, parseBooleanValues, validateRequestBody } from "./middlewares/validation.js";
import { securityHeaders, hideServer, requestId, enforceJsonContentType, sanitizeHeaders } from "./middlewares/security.js";

// Importar jobs e utilitários
import cleanupRefreshTokens from './jobs/cleanupRefreshTokens.js';

dotenv.config();
const app = express();

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO DE BODY PARSER - Deve ser primeira coisa após criar app
// ═══════════════════════════════════════════════════════════════════════════
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARES DE SEGURANÇA - Executam PRIMEIRO
// ═══════════════════════════════════════════════════════════════════════════
app.use(hideServer);               // Remove headers de informação do servidor
app.use(securityHeaders);          // Adiciona headers de segurança HTTP
app.use(requestId);                // Adiciona ID único a cada requisição
app.use(sanitizeHeaders);          // Remove headers perigosos
app.use(enforceJsonContentType);   // Valida Content-Type para POST/PUT/PATCH

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARES GLOBAIS - Executam para TODAS as requisições
// ═══════════════════════════════════════════════════════════════════════════
app.use(cors());
app.set("trust proxy", 1); // Para funcionar atrás de proxy (importante para rate limiting)

// Logging de requisições (agora mais bem estruturado)
app.use(requestLogger);

// Sanitização de inputs (remover espaços extras)
app.use(sanitizeInputs);

// Parse de valores booleanos
app.use(parseBooleanValues);

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITING - Proteger contra abuso
// ═══════════════════════════════════════════════════════════════════════════
const apiLimiter = createApiLimiter({ windowMs: 15 * 60 * 1000, max: 250 });
// Usar os limiters padrão (já configurados) para leitura/escrita
const readLimiter = defaultReadLimiter;
const writeLimiter = defaultWriteLimiter;

// Aplicar limiter global (geral para toda API)
app.use("/alunos", apiLimiter);
app.use("/cursos", apiLimiter);
app.use("/matriculas", apiLimiter);
app.use("/auth", apiLimiter);
app.use("/instrutores", apiLimiter);
app.use("/categorias", apiLimiter);
app.use("/avaliacoes", apiLimiter);
// ═══════════════════════════════════════════════════════════════════════════
// ROTAS
// ═══════════════════════════════════════════════════════════════════════════
// Aplicar limiters específicos por método (read / write) e depois montar as rotas
const applyMethodLimiters = (readLimiterFn, writeLimiterFn) => {
  return [
    (req, res, next) => (req.method === 'GET' ? readLimiterFn(req, res, next) : next()),
    (req, res, next) => (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? writeLimiterFn(req, res, next) : next())
  ];
};

app.use("/alunos", applyMethodLimiters(readLimiter, writeLimiter), alunoRoutes);
app.use("/cursos", applyMethodLimiters(readLimiter, writeLimiter), cursoRoutes);
app.use("/matriculas", applyMethodLimiters(readLimiter, writeLimiter), matriculaRoutes);
app.use("/auth", applyMethodLimiters(readLimiter, writeLimiter), authRoutes);
app.use("/instrutores", applyMethodLimiters(readLimiter, writeLimiter), instrutorRoutes);
app.use("/categorias", applyMethodLimiters(readLimiter, writeLimiter), categoriaRoutes);
app.use("/avaliacoes", applyMethodLimiters(readLimiter, writeLimiter), avaliacaoRoutes);

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTAÇÃO
// ═══════════════════════════════════════════════════════════════════════════
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ═══════════════════════════════════════════════════════════════════════════
// ROTAS GERAIS
// ═══════════════════════════════════════════════════════════════════════════
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ API do SENAC está rodando! 🚀",
    version: "1.0.0",
    endpoints: {
      docs: "http://localhost:3000/api/docs",
      health: "http://localhost:3000/health"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE DE ERRO GLOBAL - DEVE SER O ÚLTIMO
// ═══════════════════════════════════════════════════════════════════════════
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO DO SERVIDOR
// ═══════════════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;

// Inicia o servidor somente se não estivermos em ambiente de teste.
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📄 Documentação: http://localhost:${PORT}/api/docs`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  });
}

// Exportar o app para permitir testes e reutilização sem iniciar o servidor
export default app;

// ═══════════════════════════════════════════════════════════════════════════
// TRATAMENTO DE ENCERRAMENTO GRACIOSOS
// ═══════════════════════════════════════════════════════════════════════════
process.on("SIGINT", async () => {
  console.log("🛑 Recebido sinal SIGINT - encerrando graciosamente...");
  await prisma.$disconnect();
  console.log("🧹 Prisma desconectado.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Recebido sinal SIGTERM - encerrando graciosamente...");
  await prisma.$disconnect();
  console.log("🧹 Prisma desconectado.");
  process.exit(0);
});

// ═══════════════════════════════════════════════════════════════════════════
// JOBS AGENDADOS
// ═══════════════════════════════════════════════════════════════════════════
(async () => {
  // Apenas executar se DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL não configurada - jobs de cleanup desativados");
    return;
  }

  try {
    await cleanupRefreshTokens();
    console.log("✅ Limpeza de refresh tokens executada na inicialização");

    // Executa a cada 6 horas
    setInterval(async () => {
      try {
        await cleanupRefreshTokens();
      } catch (err) {
        console.error("❌ Erro ao limpar refresh tokens:", { error: err.message });
      }
    }, 6 * 60 * 60 * 1000);

    console.log("⏰ Job de limpeza de tokens agendado para executar a cada 6 horas");
  } catch (err) {
    console.error("❌ Erro ao iniciar cleanupRefreshTokens:", { error: err.message });
  }
})();
