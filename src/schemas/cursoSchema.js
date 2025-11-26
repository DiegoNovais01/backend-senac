import { z } from "zod";

export const cursoSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  descricao: z.string().optional(),
  data_inicio: z.string().optional(), // validação de data feita no controller
  carga_horaria: z.number().int().positive().optional(),
  preco: z.number().positive().optional(),
  nivel: z.enum(["basico", "intermediario", "avancado"]).optional(),
  modalidade: z.enum(["presencial", "online", "hibrido"]).optional(),
  imagem: z.string().optional(),
  status: z.enum(["ativo", "inativo"]).optional(),
  id_categoria: z.number().int().optional(),
});

export default cursoSchema;
