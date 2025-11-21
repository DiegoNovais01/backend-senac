import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Muitas tentativas. Tente novamente mais tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createApiLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs ?? 15 * 60 * 1000,
    max: options.max ?? 100,
    message: { error: "Muitas requisições foram feitas a partir deste IP. Tente novamente mais tarde." },
    standardHeaders: true,
    legacyHeaders: false,
  })
}