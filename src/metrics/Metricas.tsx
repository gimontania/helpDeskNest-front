import { BarChart3, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getApiErrorMessage } from "../services/apiErrors";
import { getMetrics, type Metrics } from "../services/metrics";
import type { Estado } from "../services/tickets";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; metrics: Metrics };

const estadoInfo: Record<
  Estado,
  { label: string; color: string; text: string }
> = {
  ABIERTO: { label: "Abiertos", color: "#0ea5e9", text: "text-sky-300" },
  EN_PROCESO: { label: "En proceso", color: "#f59e0b", text: "text-amber-300" },
  RESUELTO: { label: "Resueltos", color: "#10b981", text: "text-emerald-300" },
  CERRADO: { label: "Cerrados", color: "#64748b", text: "text-slate-300" },
};

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 12,
  color: "#e2e8f0",
  fontSize: 13,
};

function Kpi({
  label,
  value,
  hint,
  valueClass = "text-white",
}: {
  label: string;
  value: number;
  hint?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${valueClass}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Metricas() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const request = new AbortController();
    getMetrics(request.signal).then(
      (metrics) => {
        if (!request.signal.aborted) setState({ status: "ready", metrics });
      },
      (error: unknown) => {
        if (!request.signal.aborted)
          setState({
            status: "error",
            message: getApiErrorMessage(
              error,
              "No se pudieron cargar las métricas.",
            ),
          });
      },
    );
    return () => request.abort();
  }, [attempt]);

  const metrics = state.status === "ready" ? state.metrics : null;

  const estadoData = useMemo(
    () =>
      (metrics?.porEstado ?? []).map((e) => ({
        ...e,
        nombre: estadoInfo[e.estado].label,
        color: estadoInfo[e.estado].color,
      })),
    [metrics],
  );
  const categoriaData = useMemo(
    () =>
      [...(metrics?.porCategoria ?? [])].sort(
        (a, b) => b.cantidad - a.cantidad || a.nombre.localeCompare(b.nombre),
      ),
    [metrics],
  );

  return (
    <section className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Métricas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Volumen y estado de los tickets de soporte.
        </p>
      </div>

      {state.status === "loading" && (
        <div
          role="status"
          className="flex items-center gap-2 py-10 text-slate-500"
        >
          <Loader2 className="h-5 w-5 animate-spin" /> Cargando métricas…
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-xl bg-rose-500/10 p-4 ring-1 ring-inset ring-rose-500/30">
          <p role="alert" className="text-sm text-rose-300">
            {state.message}
          </p>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((v) => v + 1);
            }}
            className="mt-3 rounded-lg border border-rose-500/30 px-3 py-1.5 text-sm text-rose-200 hover:bg-rose-500/10"
          >
            Reintentar
          </button>
        </div>
      )}

      {metrics && metrics.total === 0 && (
        <div
          role="status"
          className="flex flex-col items-center rounded-2xl border border-dashed border-slate-800 py-16 text-center"
        >
          <BarChart3 className="h-10 w-10 text-slate-700" />
          <p className="mt-3 text-sm font-medium text-slate-400">
            Aún no hay tickets para mostrar métricas.
          </p>
        </div>
      )}

      {metrics && metrics.total > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Kpi label="Total" value={metrics.total} hint="Todos los tickets" />
            {metrics.porEstado.map((e) => (
              <Kpi
                key={e.estado}
                label={estadoInfo[e.estado].label}
                value={e.cantidad}
                valueClass={estadoInfo[e.estado].text}
                hint={`${Math.round((e.cantidad / metrics.total) * 100)}% del total`}
              />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <figure className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <figcaption className="mb-3 text-sm font-semibold text-white">
                Tickets por estado
              </figcaption>
              <div
                className="h-72 w-full"
                role="img"
                aria-label="Gráfico de barras de tickets por estado"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={estadoData}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="nombre"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{ fill: "#1e293b" }}
                      formatter={(v) => [v, "Tickets"]}
                    />
                    <Bar
                      dataKey="cantidad"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={56}
                    >
                      {estadoData.map((d) => (
                        <Cell key={d.estado} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </figure>

            <figure className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <figcaption className="mb-3 text-sm font-semibold text-white">
                Tickets por categoría
              </figcaption>
              {categoriaData.length === 0 ? (
                <p
                  role="status"
                  className="py-10 text-center text-sm text-slate-500"
                >
                  No hay categorías registradas.
                </p>
              ) : (
                <div
                  className="w-full overflow-y-auto"
                  style={{ maxHeight: 360 }}
                  role="img"
                  aria-label="Gráfico de barras de tickets por categoría"
                >
                  <div
                    style={{ height: Math.max(240, categoriaData.length * 40) }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoriaData}
                        layout="vertical"
                        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid stroke="#1e293b" horizontal={false} />
                        <XAxis
                          type="number"
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                          allowDecimals={false}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="nombre"
                          width={110}
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          interval={0}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          cursor={{ fill: "#1e293b" }}
                          formatter={(v) => [v, "Tickets"]}
                        />
                        <Bar
                          dataKey="cantidad"
                          fill="#8b5cf6"
                          radius={[0, 6, 6, 0]}
                          maxBarSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </figure>
          </div>

          <details className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <summary className="cursor-pointer text-sm font-medium text-slate-300">
              Ver datos en tabla
            </summary>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <table className="w-full text-sm">
                <caption className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Por estado
                </caption>
                <tbody>
                  {metrics.porEstado.map((e) => (
                    <tr key={e.estado} className="border-t border-slate-800">
                      <th
                        scope="row"
                        className="py-1.5 text-left font-normal text-slate-400"
                      >
                        {estadoInfo[e.estado].label}
                      </th>
                      <td className="py-1.5 text-right tabular-nums text-slate-200">
                        {e.cantidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full text-sm">
                <caption className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Por categoría
                </caption>
                <tbody>
                  {categoriaData.map((c) => (
                    <tr
                      key={c.categoriaId}
                      className="border-t border-slate-800"
                    >
                      <th
                        scope="row"
                        className="py-1.5 text-left font-normal text-slate-400"
                      >
                        {c.nombre}
                      </th>
                      <td className="py-1.5 text-right tabular-nums text-slate-200">
                        {c.cantidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
