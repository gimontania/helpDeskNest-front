import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Loader2, Mail, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { getTicket, type Ticket } from "../services/tickets";
import { useSession } from "../session";
import { Assignment } from "./Assignment";
import { EstadoBadge, PrioridadBadge, CategoryBadge } from "./TicketBadge";

export function TicketDetail() {
  const { id = "" } = useParams();
  if (!z.uuid().safeParse(id).success)
    return <p role="alert">El identificador del ticket no es válido.</p>;
  return <TicketContent key={id} id={id} />;
}

function TicketContent({ id }: { id: string }) {
  const role = useSession((state) => state.session?.role);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const request = new AbortController();
    getTicket(id, request.signal).then(
      (result) => {
        if (!request.signal.aborted) setTicket(result);
      },
      () => {
        if (!request.signal.aborted) setError(true);
      },
    );
    return () => request.abort();
  }, [id, attempt]);

  const back = role === "EMPLEADO" ? "/mis-tickets" : "/tickets";
  if (error)
    return (
      <div className="rounded-xl bg-rose-500/10 p-4 ring-1 ring-inset ring-rose-500/30">
        <p role="alert" className="text-sm text-rose-300">
          No se pudo cargar el ticket.
        </p>
        <button
          type="button"
          className="mt-3 rounded-lg border border-rose-500/30 px-3 py-1.5 text-sm text-rose-200 hover:bg-rose-500/10"
          onClick={() => {
            setError(false);
            setAttempt((v) => v + 1);
          }}
        >
          Reintentar
        </button>
      </div>
    );

  if (!ticket)
    return (
      <div
        role="status"
        className="flex items-center gap-2 py-10 text-slate-500"
      >
        <Loader2 className="h-5 w-5 animate-spin" /> Cargando ticket…
      </div>
    );

  return (
    <section className="grid min-w-0 gap-6 wrap-anywhere">
      <Link
        to={back}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a la bandeja
      </Link>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <EstadoBadge estado={ticket.estado} />
          <PrioridadBadge prioridad={ticket.prioridad} />
          <CategoryBadge nombre={ticket.categoria.nombre} />
        </div>
        <h1 className="text-xl font-semibold text-white">{ticket.titulo}</h1>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(ticket.creadoEn).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {ticket.creador.nombre}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            {ticket.creador.email}
          </span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Descripción
        </p>
        <p className="whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-3 text-sm leading-relaxed text-slate-300">
          {ticket.descripcion}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Responsable
        </p>
        <p className="mt-1 text-sm text-slate-200">
          {ticket.agente?.nombre ?? "Sin asignar"}
        </p>
        {(role === "ADMIN" || role === "AGENTE") && (
          <div className="mt-4 border-t border-slate-800 pt-4">
            <Assignment ticket={ticket} onAssigned={setTicket} />
          </div>
        )}
      </div>
    </section>
  );
}
