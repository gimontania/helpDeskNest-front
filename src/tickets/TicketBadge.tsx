import type { Estado, Prioridad } from "../services/tickets";

const estadoStyle: Record<Estado, { label: string; cls: string }> = {
  ABIERTO: { label: "Abierto", cls: "bg-sky-100 text-sky-900" },
  EN_PROCESO: { label: "En proceso", cls: "bg-amber-100 text-amber-900" },
  RESUELTO: { label: "Resuelto", cls: "bg-emerald-100 text-emerald-900" },
  CERRADO: { label: "Cerrado", cls: "bg-slate-200 text-slate-800" },
};

const prioridadStyle: Record<Prioridad, { label: string; cls: string }> = {
  BAJA: { label: "Baja", cls: "bg-slate-100 text-slate-800" },
  MEDIA: { label: "Media", cls: "bg-blue-100 text-blue-900" },
  ALTA: { label: "Alta", cls: "bg-orange-100 text-orange-900" },
  URGENTE: { label: "Urgente", cls: "bg-red-100 text-red-900" },
};

const base = "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold";

export const estadoLabel = (e: Estado) => estadoStyle[e].label;

export function EstadoBadge({ estado }: { estado: Estado }) {
  const { label, cls } = estadoStyle[estado];
  return <span className={`${base} ${cls}`}>{label}</span>;
}

export function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  const { label, cls } = prioridadStyle[prioridad];
  return <span className={`${base} ${cls}`}>{label}</span>;
}
