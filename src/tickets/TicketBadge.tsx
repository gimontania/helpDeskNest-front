import type { Estado, Prioridad } from "../services/tickets";

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

const estadoStyle: Record<Estado, { label: string; cls: string }> = {
  ABIERTO: {
    label: "Abierto",
    cls: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  },
  EN_PROCESO: {
    label: "En proceso",
    cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  },
  RESUELTO: {
    label: "Resuelto",
    cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  },
  CERRADO: {
    label: "Cerrado",
    cls: "bg-slate-500/15 text-slate-400 ring-slate-500/30",
  },
};

const prioridadStyle: Record<Prioridad, { label: string; cls: string }> = {
  BAJA: {
    label: "Baja",
    cls: "bg-slate-500/15 text-slate-400 ring-slate-500/30",
  },
  MEDIA: { label: "Media", cls: "bg-sky-500/15 text-sky-300 ring-sky-500/30" },
  ALTA: {
    label: "Alta",
    cls: "bg-orange-500/15 text-orange-300 ring-orange-500/30",
  },
  URGENTE: {
    label: "Urgente",
    cls: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  },
};

export const estadoLabel = (e: Estado) => estadoStyle[e].label;

export function EstadoBadge({ estado }: { estado: Estado }) {
  const { label, cls } = estadoStyle[estado];
  return <span className={`${base} ${cls}`}>{label}</span>;
}

export function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  const { label, cls } = prioridadStyle[prioridad];
  return <span className={`${base} ${cls}`}>{label}</span>;
}

export function CategoryBadge({ nombre }: { nombre: string }) {
  return (
    <span
      className={`${base} bg-violet-500/15 text-violet-300 ring-violet-500/30`}
    >
      {nombre}
    </span>
  );
}
