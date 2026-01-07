/**
 * Middleware de segurança - adiciona headers de segurança HTTP importantes
 * Protege contra ataques comuns (XSS, Clickjacking, MIME type sniffing, etc)
 */

export const securityHeaders = (req, res, next) => {
  // Previne Clickjacking (X-Frame-Options)
  res.setHeader('X-Frame-Options', 'DENY');

  // Previne MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Habilita XSS protection no navegador
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy - restringe origem de scripts, styles, etc
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");

  // Previne envio de referrer para origens externas
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Força HTTPS (se em produção)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Previne acesso a características perigosas
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * Middleware para remover headers informativos
 * Não expõe informações sobre o servidor
 */
export const hideServer = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
};

/**
 * Middleware para adicionar um ID único a cada request (para tracking)
 */
export const requestId = (req, res, next) => {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

/**
 * Middleware para validar que o content-type é JSON para POST/PUT/PATCH
 */
export const enforceJsonContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');

    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        success: false,
        error: 'Unsupported Media Type',
        message: 'Content-Type deve ser application/json',
        receivedContentType: contentType
      });
    }
  }

  next();
};

/**
 * Middleware para sanitizar headers perigosos
 */
export const sanitizeHeaders = (req, res, next) => {
  // Remove headers que podem ser usados para ataques
  const dangerousHeaders = ['x-forwarded-for', 'x-original-url', 'x-rewrite-url'];

  dangerousHeaders.forEach(header => {
    if (header in req.headers) {
      delete req.headers[header];
    }
  });

  next();
};
