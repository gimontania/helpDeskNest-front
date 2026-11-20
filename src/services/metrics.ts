import { z } from "zod";
import api from "./api";
import { estados } from "./tickets";

const metricsSchema = z.object({
  total: z.number().int().nonnegative(),
  porEstado: z.array(
    z.object({
      estado: z.enum(estados),
      cantidad: z.number().int().nonnegative(),
    }),
  ),
  porCategoria: z.array(
    z.object({
      categoriaId: z.uuid(),
      nombre: z.string(),
      cantidad: z.number().int().nonnegative(),
    }),
  ),
});

export type Metrics = z.infer<typeof metricsSchema>;

export async function getMetrics(signal?: AbortSignal): Promise<Metrics> {
  const { data } = await api.get<unknown>("/tareas/metricas", { signal });
  return metricsSchema.parse(data);
}
