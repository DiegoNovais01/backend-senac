import { logger } from '../utils/logger.js';

// Middleware de logging de requisições
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Interceptar o envio de resposta
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log com cores baseado no status
    logger.logRequest(req.method, req.path, statusCode, duration);
    
    // Se for erro, log adicional
    if (statusCode >= 400) {
      logger.debug(`Request body: ${req.method} ${req.path}`, {
        body: req.body,
        query: req.query,
        params: req.params
      });
    }
    
    // Chamar o send original
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware de logging de erros (executado quando erro é capturado)
export const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  logger.error(`🔥 Error ao processar ${req.method} ${req.path}`, {
    timestamp,
    error: err.message,
    code: err.code,
    statusCode: err.statusCode || 500,
    body: req.body,
    user: req.user?.id || 'anônimo'
  });
  
  next(err);
};
