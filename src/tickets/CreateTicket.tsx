
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createTicket } from "../services/tickets";
import { getApiErrorMessage } from "../services/apiErrors";
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

  const submit = handleSubmit(async (values) => {
    setApiError("");

    try {
      await createTicket(values);

      toast.success("Ticket creado correctamente.");

      navigate("/mis-tickets", { replace: true });
    } catch (error) {
      setApiError(
        getApiErrorMessage(
          error,
          "No se pudo crear el ticket. Intenta nuevamente.",
        ),
      );
    }
  });

  return (
    <section className="mx-auto grid max-w-2xl gap-6">
      <div>
        <Link
          to="/mis-tickets"
          className="text-sm font-medium text-sky-800 underline"
        >
          Volver a mis tickets
        </Link>

        <h1 className="mt-3 text-2xl font-bold">
          Crear ticket de soporte
        </h1>

        <p className="mt-2 text-slate-600">
          Describe tu problema para que nuestro equipo pueda ayudarte.
        </p>
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label className="grid gap-2">
          <span className="font-medium">Título del problema</span>

          <input
            type="text"
            maxLength={200}
            placeholder="Ej. No puedo ingresar al sistema"
            aria-invalid={!!errors.titulo}
            aria-describedby={errors.titulo ? "titulo-error" : undefined}
            className="rounded-md border border-slate-300 p-3 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
            {...register("titulo")}
          />

          {errors.titulo && (
            <span id="titulo-error" role="alert" className="text-sm text-red-700">
              {errors.titulo.message}
            </span>
          )}
        </label>

        <label className="grid gap-2">
          <span className="font-medium">Descripción del problema</span>

          <textarea
            rows={5}
            placeholder="Explica qué ocurrió y qué necesitas solucionar..."
            aria-invalid={!!errors.descripcion}
            aria-describedby={
              errors.descripcion ? "descripcion-error" : undefined
            }
            className="resize-y rounded-md border border-slate-300 p-3 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
            {...register("descripcion")}
          />

          {errors.descripcion && (
            <span
              id="descripcion-error"
              role="alert"
              className="text-sm text-red-700"
            >
              {errors.descripcion.message}
            </span>
          )}
        </label>

        <div className="grid gap-2">
          <CategorySelect
            {...register("categoriaId")}
            aria-invalid={!!errors.categoriaId}
          />

          {errors.categoriaId && (
            <span role="alert" className="text-sm text-red-700">
              {errors.categoriaId.message}
            </span>
          )}
        </div>

        <label className="grid gap-2">
          <span className="font-medium">Prioridad</span>

          <select
            className="rounded-md border border-slate-300 bg-white p-3 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
            aria-invalid={!!errors.prioridad}
            {...register("prioridad")}
          >
            <option value="BAJA">Baja</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="URGENTE">Urgente</option>
          </select>

          {errors.prioridad && (
            <span role="alert" className="text-sm text-red-700">
              {errors.prioridad.message}
            </span>
          )}
        </label>

        {apiError && (
          <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {apiError}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
          <Link
            to="/mis-tickets"
            className="rounded-md border border-slate-300 px-4 py-2 hover:bg-slate-100"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-sky-800 px-5 py-2 font-semibold text-white hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creando ticket..." : "Crear ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}
