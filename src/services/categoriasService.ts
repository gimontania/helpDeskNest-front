import api from "./api";
import type { Category, CategoryFormValues } from "../schemas/categorySchema";

const body = ({ nombre, descripcion }: CategoryFormValues) => ({
  nombre,
  descripcion: descripcion || undefined,
});

export const categoriasApi = {
  listar: () => api.get<Category[]>("/categorias").then((r) => r.data),

  crear: (values: CategoryFormValues) =>
    api.post<Category>("/categorias", body(values)).then((r) => r.data),

  actualizar: (id: string, values: CategoryFormValues) =>
    api
      .patch<Category>(`/categorias/${id}`, {
        nombre: values.nombre,
        descripcion: values.descripcion,
      })
      .then((r) => r.data),

  eliminar: (id: string) =>
    api.delete<Category>(`/categorias/${id}`).then((r) => r.data),
};
