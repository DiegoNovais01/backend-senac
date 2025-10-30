import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "senha_token";

// Middleware pra proteger rotas
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // salva o usuário logado no req
    console.log("oi")
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido ou expirado" });
  }
};
