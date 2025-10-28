import { z } from "zod";

export const alunoSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  data_nascimento: z.string().optional(),
});
