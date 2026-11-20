import { z } from "zod";

export const createTicketSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(200, "El título no puede superar los 200 caracteres."),

  descripcion: z
    .string()
    .trim()
    .min(1, "La descripción es obligatoria."),

  prioridad: z.enum(
    ["BAJA", "MEDIA", "ALTA", "URGENTE"],
    "Selecciona una prioridad válida.",
  ),

  categoriaId: z
    .string()
    .trim()
    .min(1, "Debes seleccionar una categoría.")
    .refine(
      (value) => z.uuid().safeParse(value).success,
      "La categoría seleccionada no es válida.",
    ),
});

export type CreateTicketFormValues = z.infer<
  typeof createTicketSchema
>;