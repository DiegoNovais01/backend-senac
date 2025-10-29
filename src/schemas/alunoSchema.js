import { z } from "zod";

export const alunoSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido").or(z.string().length(11, "CPF deve ter 11 dígitos")),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone inválido"),
  endereco: z.string().min(5, "Endereço muito curto"),
  data_nascimento: z.string().optional(),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres")
});
