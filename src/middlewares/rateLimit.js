import rateLimit from "express-rate-limit";
import { logger } from '../utils/logger.js';

// Rate limiter para autenticação (mais rigoroso)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 tentativas
  message: {
    success: false,
    error: "Muitas tentativas de autenticação. Tente novamente em 15 minutos."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => {
    // Skip rate limit se estiver em modo teste
    return process.env.NODE_ENV === 'test';
  },
  handler: (req, res) => {
    logger.warn(`Rate limit excedido para autenticação do IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: "Muitas tentativas. Tente novamente mais tarde."
    });
  }
});

// Rate limiter geral da API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: {
    success: false,
    error: "Muitas requisições foram feitas. Tente novamente mais tarde."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req, res) => process.env.NODE_ENV === 'test',
  handler: (req, res) => {
    logger.warn(`Rate limit excedido para IP: ${req.ip} na rota ${req.path}`);
    res.status(429).json({
      success: false,
      error: "Limite de requisições excedido."
    });
  }
});

// Rate limiter customizável
export const createApiLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs ?? 15 * 60 * 1000,
    max: options.max ?? 100,
    message: {
      success: false,
      error: options.message ?? "Muitas requisições foram feitas. Tente novamente mais tarde."
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => process.env.NODE_ENV === 'test',
    handler: (req, res) => {
      logger.warn(`Rate limit ${options.name ?? 'customizado'} excedido para IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: options.message ?? "Limite de requisições excedido."
      });
    }
  });
};

// Rate limiter relaxado para leitura (GET)
export const readLimiter = createApiLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300, // Mais permissivo para leitura
  message: "Muitas requisições de leitura. Aguarde um pouco.",
  name: "read"
});

// Rate limiter restritivo para escrita (POST, PUT, DELETE)
export const writeLimiter = createApiLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50, // Mais restritivo para escrita
  message: "Muitas requisições de modificação. Aguarde um pouco.",
  name: "write"
});