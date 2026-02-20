import { z } from "zod";

export const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").regex(/^(?=.*[A-Z])(?=.*[0-9])/, "Senha deve conter letras maiúsculas e números"),
  papel: z.enum(["admin", "professor", "aluno", "secretaria"]).optional().default("aluno"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha obrigatória"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token obrigatório"),
});

export const mudarSenhaSchema = z.object({
  senha_atual: z.string().min(1, "Senha atual obrigatória"),
  senha_nova: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").regex(/^(?=.*[A-Z])(?=.*[0-9])/, "Senha deve conter letras maiúsculas e números"),
});

export const recuperarSenhaSchema = z.object({
  email: z.string().email("Email inválido"),
});

