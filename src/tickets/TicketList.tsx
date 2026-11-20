import { LoadingState, ErrorState, EmptyState } from "../feedback/States";
import { Search, User2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../services/apiErrors";
import {
  estados,
  estadoLabel,
  listTickets,
  type Estado,
  type Ticket,
} from "../services/tickets";
import { useSession } from "../session";
import { CategoryBadge, EstadoBadge, PrioridadBadge } from "./TicketBadge";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; tickets: Ticket[] };

const selectClass =
  "rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)} d`;
  return new Date(iso).toLocaleDateString();
}

export function TicketList({
  soloAsignados = false,
}: {
  soloAsignados?: boolean;
}) {
  const userId = useSession((s) => s.session?.id);
  const role = useSession((s) => s.session?.role);
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [estado, setEstado] = useState<Estado | "">("");
  const [categoriaId, setCategoriaId] = useState("");
  const [search, setSearch] = useState("");

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

  const tickets = useMemo(() => {
    if (state.status !== "ready") return [];
    return soloAsignados
      ? state.tickets.filter((t) => t.agenteId === userId)
      : state.tickets;
  }, [state, soloAsignados, userId]);

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
  const titulo = soloAsignados
    ? "Tickets Asigandos"
    : role === "EMPLEADO"
      ? "Mis tickets"
      : "Bandeja de tickets";

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-2xl font-bold text-white">{titulo}</h1>
        {state.status === "ready" && (
          <p role="status" className="mt-1 text-sm text-slate-500">
            {visibles.length} de {tickets.length} tickets
          </p>
        )}
      </div>

      {state.status === "loading" && (
        <LoadingState message="Cargando tickets…" />
      )}
      {state.status === "error" && (
        <ErrorState
          message={state.message}
          onRetry={() => {
            setState({ status: "loading" });
            setAttempt((value) => value + 1);
          }}
        />
      )}

      {state.status === "ready" && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título…"
                aria-label="Buscar tickets"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <select
              aria-label="Estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as Estado | "")}
              className={selectClass}
            >
              <option value="">Todos los estados</option>
              {estados.map((e) => (
                <option key={e} value={e}>
                  {estadoLabel(e)}
                </option>
              ))}
            </select>
            <select
              aria-label="Categoría"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className={selectClass}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>
            {hayFiltros && (
              <button
                type="button"
                onClick={() => {
                  setEstado("");
                  setCategoriaId("");
                  setSearch("");
                }}
                className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {visibles.length === 0 ? (
            <EmptyState
              message={
                tickets.length === 0
                  ? "No hay tickets disponibles"
                  : "Ningún ticket coincide con los filtros"
              }
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((t) => (
                <li key={t.id}>
                  <Link
                    to={"/tickets/" + t.id}
                    className="grid h-full min-w-0 gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-700 hover:bg-slate-800/60"
                  >
                    <h2 className="line-clamp-2 text-sm font-semibold text-slate-100 wrap-anywhere">
                      {t.titulo}
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      <EstadoBadge estado={t.estado} />
                      <PrioridadBadge prioridad={t.prioridad} />
                      <CategoryBadge nombre={t.categoria.nombre} />
                    </div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      {role !== "EMPLEADO" && (
                        <span className="inline-flex items-center gap-1">
                          <User2 className="h-3 w-3" /> {t.creador.nombre}
                        </span>
                      )}
                      <span>
                        {t.agente
                          ? `Responsable: ${t.agente.nombre}`
                          : "Sin asignar"}
                      </span>
                      <span>{timeAgo(t.creadoEn)}</span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
