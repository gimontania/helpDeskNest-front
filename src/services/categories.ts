import { z } from "zod";
import api from "./api";
import {
  categorySchema,
  type Category,
  type CategoryFormValues,
} from "../schemas/categorySchema";

export type { Category };

export async function listCategories(
  signal?: AbortSignal,
): Promise<Category[]> {
  const { data } = await api.get<unknown>("/categorias", { signal });
  return z.array(categorySchema).parse(data);
}

export async function createCategory(
  values: CategoryFormValues,
): Promise<Category> {
  const { data } = await api.post<unknown>("/categorias", {
    nombre: values.nombre,
    descripcion: values.descripcion || undefined,
  });
  return categorySchema.parse(data);
}

export async function updateCategory(
  id: string,
  values: CategoryFormValues,
): Promise<Category> {
  const { data } = await api.patch<unknown>(`/categorias/${id}`, {
    nombre: values.nombre,
    descripcion: values.descripcion,
  });
  return categorySchema.parse(data);
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categorias/${id}`);
}
