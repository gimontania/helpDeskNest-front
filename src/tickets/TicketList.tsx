import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../services/apiErrors";
import {
  estados,
  listTickets,
  type Estado,
  type Ticket,
} from "../services/tickets";
import { useSession } from "../session";
import { EstadoBadge, PrioridadBadge, estadoLabel } from "./TicketBadge";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; tickets: Ticket[] };

export function TicketList() {
  const role = useSession((s) => s.session?.role);
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [estado, setEstado] = useState<Estado | "">("");
  const [categoriaId, setCategoriaId] = useState("");

  useEffect(() => {
    const request = new AbortController();
    listTickets(request.signal).then(
      (tickets) => {
        if (!request.signal.aborted) setState({ status: "ready", tickets });
      },
      (error: unknown) => {
        if (!request.signal.aborted)
          setState({
            status: "error",
            message: getApiErrorMessage(error, "No se pudo cargar la bandeja."),
          });
      },
    );
    return () => request.abort();
  }, [attempt]);

  const tickets = state.status === "ready" ? state.tickets : [];

  const categorias = useMemo(() => {
    const map = new Map<string, string>();
    tickets.forEach((t) => map.set(t.categoria.id, t.categoria.nombre));
    return [...map].sort((a, b) => a[1].localeCompare(b[1]));
  }, [tickets]);

  const visibles = tickets.filter(
    (t) =>
      (!estado || t.estado === estado) &&
      (!categoriaId || t.categoriaId === categoriaId),
  );
  const hayFiltros = estado !== "" || categoriaId !== "";
  const titulo = role === "EMPLEADO" ? "Mis tickets" : "Bandeja de tickets";

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">{titulo}</h1>

      {state.status === "loading" && <p role="status">Cargando tickets…</p>}

      {state.status === "error" && (
        <div>
          <p role="alert" className="text-red-700">
            {state.message}
          </p>
          <button
            type="button"
            className="mt-2 rounded border px-3 py-2 hover:bg-slate-100"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((v) => v + 1);
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {state.status === "ready" && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">
              Estado
              <select
                className="rounded-md border border-slate-400 bg-white p-2"
                value={estado}
                onChange={(e) => setEstado(e.target.value as Estado | "")}
              >
                <option value="">Todos</option>
                {estados.map((e) => (
                  <option key={e} value={e}>
                    {estadoLabel(e)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Categoría
              <select
                className="rounded-md border border-slate-400 bg-white p-2"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Todas</option>
                {categorias.map(([id, nombre]) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
            </label>
            {hayFiltros && (
              <button
                type="button"
                className="rounded border px-3 py-2 hover:bg-slate-100"
                onClick={() => {
                  setEstado("");
                  setCategoriaId("");
                }}
              >
                Limpiar filtros
              </button>
            )}
            <p className="text-sm text-slate-600" role="status">
              {visibles.length} de {tickets.length} tickets
            </p>
          </div>

          {tickets.length === 0 && (
            <p role="status">No hay tickets disponibles.</p>
          )}
          {tickets.length > 0 && visibles.length === 0 && (
            <p role="status">Ningún ticket coincide con los filtros.</p>
          )}

          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map((t) => (
              <li
                key={t.id}
                className="grid min-w-0 gap-2 rounded-lg border border-slate-200 bg-white p-4 wrap-anywhere"
              >
                <Link
                  to={"/tickets/" + t.id}
                  className="font-semibold text-sky-800 underline"
                >
                  {t.titulo}
                </Link>
                <div className="flex flex-wrap gap-2">
                  <EstadoBadge estado={t.estado} />
                  <PrioridadBadge prioridad={t.prioridad} />
                </div>
                <p className="text-sm text-slate-600">
                  Categoría: {t.categoria.nombre}
                </p>
                {role !== "EMPLEADO" && (
                  <p className="text-sm text-slate-600">
                    Creado por {t.creador.nombre} · Responsable:{" "}
                    {t.agente?.nombre ?? "Sin asignar"}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
