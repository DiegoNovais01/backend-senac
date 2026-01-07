// Logger simples estruturado sem dependências externas
const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const COLORS = {
  ERROR: '\x1b[31m',    // Vermelho
  WARN: '\x1b[33m',     // Amarelo
  INFO: '\x1b[36m',     // Ciano
  DEBUG: '\x1b[90m',    // Cinza
  RESET: '\x1b[0m'      // Reset
};

function formatTimestamp() {
  const now = new Date();
  return now.toISOString();
}

function formatLog(level, message, data = null) {
  const timestamp = formatTimestamp();
  const color = COLORS[level];
  const prefix = `${color}[${timestamp}] [${level}]${COLORS.RESET}`;

  let output = `${prefix} ${message}`;

  if (data) {
    try {
      output += ` ${JSON.stringify(data, null, 2)}`;
    } catch (e) {
      output += ` ${data}`;
    }
  }

  return output;
}

export const logger = {
  error: (message, data = null) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
  },

  warn: (message, data = null) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
  },

  info: (message, data = null) => {
    console.log(formatLog(LOG_LEVELS.INFO, message, data));
  },

  debug: (message, data = null) => {
    if (process.env.DEBUG === 'true') {
      console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  },

  // Log de requisição HTTP
  logRequest: (method, path, statusCode, duration) => {
    const level = statusCode >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;
    const message = `${method} ${path} - ${statusCode} (${duration}ms)`;
    console.log(formatLog(level, message));
  },

  // Log de erro de banco de dados
  logDbError: (operation, error, data = null) => {
    logger.error(`Database Error - ${operation}`, {
      code: error.code,
      message: error.message,
      details: data
    });
  }
};
