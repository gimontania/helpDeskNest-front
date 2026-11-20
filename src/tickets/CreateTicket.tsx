import { ErrorState, LoadingState } from "../feedback/States";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createTicket } from "../services/tickets";
import { normalizeApiError } from "../services/apiErrors";
import {
  createTicketSchema,
  type CreateTicketFormValues,
} from "../schemas/createTicketSchema";
import { CategorySelect } from "../categories/CategorySelect";

export function CreateTicket() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      prioridad: "MEDIA",
      categoriaId: "",
    },
  });

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 aria-[invalid=true]:border-rose-500 disabled:opacity-60";
  const labelClass = "text-sm font-medium text-slate-200";
  const errorClass = "text-sm text-rose-400";

  const submit = handleSubmit(async (values) => {
    setApiError("");

    try {
      await createTicket(values);

      toast.success("Ticket creado correctamente.");

      navigate("/mis-tickets", { replace: true });
    } catch (error) {
      const normalized = normalizeApiError(error);
      for (const field of [
        "titulo",
        "descripcion",
        "prioridad",
        "categoriaId",
      ] as const) {
        if (normalized.fields[field])
          setError(field, { message: normalized.fields[field] });
      }
      setApiError(normalized.message);
    }
  });

  return (
    <section className="mx-auto grid max-w-2xl gap-6">
      <div>
        <Link
          to="/mis-tickets"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-400 hover:text-sky-300"
        >
          ← Volver a mis tickets
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-white">
          Crear ticket de soporte
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Describe tu problema para que nuestro equipo pueda ayudarte.
        </p>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="grid gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20"
      >
        <label className="grid gap-1.5">
          <span className={labelClass}>Título del problema</span>
          <input
            type="text"
            maxLength={200}
            placeholder="Ej. No puedo ingresar al sistema"
            aria-invalid={!!errors.titulo}
            aria-describedby={errors.titulo ? "titulo-error" : undefined}
            className={inputClass}
            {...register("titulo")}
          />
          {errors.titulo && (
            <span id="titulo-error" role="alert" className={errorClass}>
              {errors.titulo.message}
            </span>
          )}
        </label>

        <label className="grid gap-1.5">
          <span className={labelClass}>Descripción del problema</span>
          <textarea
            rows={5}
            placeholder="Explica qué ocurrió y qué necesitas solucionar..."
            aria-invalid={!!errors.descripcion}
            aria-describedby={
              errors.descripcion ? "descripcion-error" : undefined
            }
            className={`${inputClass} resize-y`}
            {...register("descripcion")}
          />
          {errors.descripcion && (
            <span id="descripcion-error" role="alert" className={errorClass}>
              {errors.descripcion.message}
            </span>
          )}
        </label>

        <div className="grid gap-1.5">
          <CategorySelect
            {...register("categoriaId")}
            aria-invalid={!!errors.categoriaId}
          />
          {errors.categoriaId && (
            <span role="alert" className={errorClass}>
              {errors.categoriaId.message}
            </span>
          )}
        </div>

        <label className="grid gap-1.5">
          <span className={labelClass}>Prioridad</span>
          <select
            className={`${inputClass} [&>option]:bg-slate-800`}
            aria-invalid={!!errors.prioridad}
            {...register("prioridad")}
          >
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </select>
          {errors.prioridad && (
            <span role="alert" className={errorClass}>
              {errors.prioridad.message}
            </span>
          )}
        </label>

        {isSubmitting && <LoadingState message="Creando ticket…" />}
        {apiError && (
          <ErrorState
            message={apiError}
            onRetry={() => void submit()}
            disabled={isSubmitting}
          />
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-800 pt-5">
          <Link
            to="/mis-tickets"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creando ticket..." : "Crear ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}
