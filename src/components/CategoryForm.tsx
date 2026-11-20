import { zodResolver } from "@hookform/resolvers/zod";
import { normalizeApiError } from "../services/apiErrors";
import { ErrorState, LoadingState } from "../feedback/States";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  categoryFormSchema,
  type Category,
  type CategoryFormValues,
} from "../schemas/categorySchema";

type Props = {
  categoria?: Category;
  onSubmit: (values: CategoryFormValues) => Promise<unknown>;
  onCancel?: () => void;
};

export function CategoryForm({ categoria, onSubmit, onCancel }: Props) {
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    },
  });

  const submit = handleSubmit(async (values) => {
    setApiError("");
    try {
      await onSubmit(values);
      if (!categoria) reset({ nombre: "", descripcion: "" });
    } catch (err) {
      const error = normalizeApiError(err);
      if (error.status === 409)
        setError("nombre", {
          message: "Ya existe una categoría con ese nombre.",
        });
      for (const field of ["nombre", "descripcion"] as const) {
        if (error.fields[field])
          setError(field, { message: error.fields[field] });
      }
      setApiError(error.message);
    }
  });

  return (
    <form
      onSubmit={submit}
      noValidate
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4"
    >
      <h2 className="text-lg font-bold">
        {categoria ? "Editar categoría" : "Nueva categoría"}
      </h2>

      <label className="grid gap-1">
        Nombre
        <input
          className="rounded-md border border-slate-400 p-2"
          aria-invalid={!!errors.nombre}
          {...register("nombre")}
        />
        {errors.nombre && (
          <span role="alert" className="text-sm text-red-700">
            {errors.nombre.message}
          </span>
        )}
      </label>

      <label className="grid gap-1">
        Descripción (opcional)
        <textarea
          rows={3}
          className="rounded-md border border-slate-400 p-2"
          aria-invalid={!!errors.descripcion}
          {...register("descripcion")}
        />
        {errors.descripcion && (
          <span role="alert" className="text-sm text-red-700">
            {errors.descripcion.message}
          </span>
        )}
      </label>

      {isSubmitting && <LoadingState message="Guardando categoría…" />}
      {apiError && (
        <ErrorState
          message={apiError}
          onRetry={() => void submit()}
          disabled={isSubmitting}
        />
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-sky-800 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting
            ? "Guardando…"
            : categoria
              ? "Guardar cambios"
              : "Crear categoría"}
        </button>
        {onCancel && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
