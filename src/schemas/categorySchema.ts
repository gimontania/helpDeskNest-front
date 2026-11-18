import { z } from "zod";

export const categorySchema = z.object({
  id: z.uuid(),
  nombre: z.string().min(1),
  descripcion: z.string().nullable(),
  creadoEn: z.iso.datetime({ offset: true }),
});

export type Category = z.infer<typeof categorySchema>;

export const categoryFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "Máximo 100 caracteres."),
  descripcion: z.string().trim(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
