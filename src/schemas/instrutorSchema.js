import { z } from "zod";

export const instrutorSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  telefone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$|^\d{10,11}$/, "Telefone inválido").optional(),
  especialidade: z.string().min(2, "Especialidade muito curta"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido"),
  foto: z.string().optional(),
});

export default instrutorSchema;
