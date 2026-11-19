import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { categoriasApi } from "../services/categoriasService";
import type { Category, CategoryFormValues } from "../schemas/categorySchema";
import { CategoryForm } from "./CategoryForm";

export function Categorias() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);

  const cargar = useCallback(async () => {
    setLoadError("");
    try {
      setItems(await categoriasApi.listar());
    } catch {
      setLoadError("No se pudo cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function crear(values: CategoryFormValues) {
    await categoriasApi.crear(values);
    toast.success("Categoría creada");
    await cargar(); // actualiza el listado
  }

  async function actualizar(values: CategoryFormValues) {
    if (!editing) return;
    await categoriasApi.actualizar(editing.id, values);
    toast.success("Categoría actualizada");
    setEditing(null);
    await cargar();
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Categorías</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Listado de categorías">
          {loading && <p>Cargando…</p>}
          {loadError && (
            <p role="alert" className="text-red-700">
              {loadError}{" "}
              <button
                className="underline"
                onClick={() => {
                  setLoading(true);
                  void cargar();
                }}
              >
                Reintentar
              </button>
            </p>
          )}
          {!loading && !loadError && items.length === 0 && (
            <p className="text-slate-600">Aún no hay categorías.</p>
          )}
          <ul className="grid gap-2">
            {items.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
              >
                <div>
                  <div className="font-semibold">{c.nombre}</div>
                  {c.descripcion && (
                    <div className="text-sm text-slate-600">
                      {c.descripcion}
                    </div>
                  )}
                </div>
                <button
                  className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
                  onClick={() => setEditing(c)}
                >
                  Editar
                </button>
              </li>
            ))}
          </ul>
        </section>

        {editing ? (
          <CategoryForm
            key={editing.id}
            categoria={editing}
            onSubmit={actualizar}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <CategoryForm key="nuevo" onSubmit={crear} />
        )}
      </div>
    </div>
  );
}
