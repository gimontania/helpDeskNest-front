import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { getTicket, type Ticket } from "../services/tickets";
import { useSession } from "../session";
import { Assignment } from "./Assignment";
import { EstadoBadge, PrioridadBadge } from "./TicketBadge";

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
      <div>
        <p role="alert">No se pudo cargar el ticket.</p>
        <button
          type="button"
          className="rounded border p-2"
          onClick={() => {
            setError(false);
            setAttempt((value) => value + 1);
          }}
        >
          Reintentar
        </button>
      </div>
    );
  if (!ticket) return <p role="status">Cargando ticket…</p>;
  return (
    <section className="grid min-w-0 gap-4 wrap-anywhere">
      <Link to={back} className="text-sky-800 underline">
        Volver a la bandeja
      </Link>
      <h1 className="text-2xl font-bold">{ticket.titulo}</h1>
      <p className="whitespace-pre-wrap">{ticket.descripcion}</p>
      <div className="flex gap-2">
        <EstadoBadge estado={ticket.estado} />
        <PrioridadBadge prioridad={ticket.prioridad} />
      </div>
      <p>
        Responsable: <strong>{ticket.agente?.nombre ?? "Sin asignar"}</strong>
      </p>
      {(role === "ADMIN" || role === "AGENTE") && (
        <Assignment ticket={ticket} onAssigned={setTicket} />
      )}
    </section>
  );
}
