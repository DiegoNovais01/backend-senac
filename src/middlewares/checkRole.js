// Middleware para verificar se o usuário tem o papel necessário
export const checkRole = (papeisPermitidos) => {
  return (req, res, next) => {
    // authMiddleware já deve ter definido req.user
    const papel = req.user?.papel;
    if (!papel) {
      return res.status(403).json({ 
        error: 'Acesso negado - usuário sem papel definido' 
      });
    }

    if (!papeisPermitidos.includes(papel)) {
      return res.status(403).json({ 
        error: 'Acesso negado - permissão insuficiente',
        papel_atual: papel,
        papeis_permitidos: papeisPermitidos
      });
    }
    
    console.log("oi")
    next();
  };
};