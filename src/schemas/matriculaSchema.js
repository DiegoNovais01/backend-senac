import { z } from "zod";

export const matriculaSchema = z.object({
  id_aluno: z.number().int({ message: "id_aluno inválido" }),
  id_curso: z.number().int({ message: "id_curso inválido" }),
  data_matricula: z.string().optional(),
  status: z.enum(["ativa", "concluida", "cancelada"]).optional(),
  nota_final: z.number().optional(),
});

export default matriculaSchema;

