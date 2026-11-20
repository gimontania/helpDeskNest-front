import { useCallback, useEffect, useState } from "react";
import { normalizeApiError, getApiErrorMessage } from "../services/apiErrors";
import { LoadingState, ErrorState, EmptyState } from "../feedback/States";
import toast from "react-hot-toast";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../services/categories";
import type { Category, CategoryFormValues } from "../schemas/categorySchema";
import { CategoryForm } from "./CategoryForm";

export function Categorias() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [selectedToDelete, setSelectedToDelete] = useState<Category | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const cargar = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError("");
    try {
      const categories = await listCategories(signal);
      if (!signal?.aborted) setItems(categories);
    } catch (error) {
      if (!signal?.aborted)
        setLoadError(
          getApiErrorMessage(error, "No se pudo cargar el catálogo."),
        );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = new AbortController();
    void cargar(request.signal);
    return () => request.abort();
  }, [cargar]);

  async function crear(values: CategoryFormValues) {
    await createCategory(values);
    toast.success("Categoría creada");
    await cargar();
  }

  async function actualizar(values: CategoryFormValues) {
    if (!editing) return;
    await updateCategory(editing.id, values);
    toast.success("Categoría actualizada");
    setEditing(null);
    await cargar();
  }

  function solicitarEliminacion(categoria: Category) {
    setSelectedToDelete(categoria);
    setDeleteError("");
  }

  async function eliminar() {
    if (!selectedToDelete || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteCategory(selectedToDelete.id);
      toast.success("Categoría eliminada");
      setSelectedToDelete(null);
      await cargar();
    } catch (error) {
      if (normalizeApiError(error).status === 409) {
        setDeleteError(
          "No se puede eliminar esta categoría porque tiene tickets asociados.",
        );
      } else if (normalizeApiError(error).status === 403) {
        setDeleteError("Tu rol no tiene permiso para eliminar categorías.");
      } else {
        setDeleteError(
          getApiErrorMessage(error, "No se pudo eliminar la categoría."),
        );
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-bold">Categorías</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-label="Listado de categorías">
          {loading && <LoadingState message="Cargando categorías…" />}
          {loadError && (
            <ErrorState message={loadError} onRetry={() => void cargar()} />
          )}
          {!loading && !loadError && items.length === 0 && (
            <EmptyState message="Aún no hay categorías." />
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

                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-100"
                    onClick={() => setEditing(c)}
                  >
                    Editar
                  </button>

                  <button
                    className="rounded-md border border-red-300 px-3 py-1 text-red-700 hover:bg-red-50"
                    onClick={() => solicitarEliminacion(c)}
                  >
                    Eliminar
                  </button>
                </div>
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

      {selectedToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !deleting) {
                setSelectedToDelete(null);
              }
            }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 id="delete-title" className="text-xl font-bold">
              Eliminar categoría
            </h2>

            <p id="delete-description" className="mt-3 text-slate-600">
              ¿Estás segura de que querés eliminar la categoría{" "}
              <strong>{selectedToDelete.nombre}</strong>?
            </p>

            {deleteError && (
              <ErrorState
                message={deleteError}
                onRetry={() => void eliminar()}
                disabled={deleting}
              />
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                autoFocus
                disabled={deleting}
                className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100 disabled:opacity-50"
                onClick={() => setSelectedToDelete(null)}
              >
                Cancelar
              </button>

              <button
                disabled={deleting}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                onClick={() => void eliminar()}
              >
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
