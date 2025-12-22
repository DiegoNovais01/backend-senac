import { z } from "zod";

export const avaliacaoSchema = z.object({
  id_curso: z.number().int({ message: "id_curso inválido" }),
  id_aluno: z.number().int({ message: "id_aluno inválido" }),
  nota: z.number().int().min(0, "Nota mínima é 0").max(10, "Nota máxima é 10"),
  comentario: z.string().optional(),
});

export default avaliacaoSchema;
