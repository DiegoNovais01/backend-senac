import { z } from "zod";

export const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  descricao: z.string().optional(),
});

export default categoriaSchema;
