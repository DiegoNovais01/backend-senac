// Middleware para verificar se o usuário tem o papel necessário
export const checkRole = (...papeisPermitidos) => {
  // aceita checkRole('admin','secretaria') ou checkRole(['admin','secretaria'])
  const allowed = Array.isArray(papeisPermitidos[0]) ? papeisPermitidos[0] : papeisPermitidos;

  return (req, res, next) => {
    const papel = req.user?.papel;
    if (!papel) {
      return res.status(401).json({ error: 'Não autenticado ou papel não definido' });
    }

    const papelLower = String(papel).toLowerCase();
    const allowedLower = allowed.map(p => String(p).toLowerCase());

    if (!allowedLower.includes(papelLower)) {
      return res.status(403).json({
        error: 'Acesso negado - permissão insuficiente',
        papel_atual: papel,
        papeis_permitidos: allowed
      });
    }

    next();
  };
};