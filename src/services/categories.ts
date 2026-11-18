import { z } from 'zod'
import api from './api'

const categorySchema = z.object({
  id: z.uuid(),
  nombre: z.string().min(1),
  descripcion: z.string().nullable(),
  creadoEn: z.iso.datetime({ offset: true }),
})

export type Category = z.infer<typeof categorySchema>

export async function listCategories(signal: AbortSignal): Promise<Category[]> {
  const { data } = await api.get<unknown>('/categorias', { signal })
  return z.array(categorySchema).parse(data)
}
