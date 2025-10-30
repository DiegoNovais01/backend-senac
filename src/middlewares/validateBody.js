export const validateBody = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed;
    next();
  } catch (err) {
    if (err.errors) {
      // Erro vindo do Zod
      return res.status(400).json({
        message: "Erro de validação no corpo da requisição",
        errors: err.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      });
    }

    // Qualquer outro erro inesperado
    console.error("Erro inesperado no validateBody:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
};
