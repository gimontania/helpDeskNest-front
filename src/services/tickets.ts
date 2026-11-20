import { z } from "zod";
import api from "./api";

export const estados = [
  "ABIERTO",
  "EN_PROCESO",
  "RESUELTO",
  "CERRADO",
] as const;

export const prioridades = ["BAJA", "MEDIA", "ALTA", "URGENTE"] as const;

const person = z.object({
  id: z.uuid(),
  nombre: z.string(),
  email: z.string(),
  rol: z.enum(["ADMIN", "AGENTE", "EMPLEADO"]),
});

export const ticketSchema = z.object({
  id: z.uuid(),
  titulo: z.string(),
  descripcion: z.string(),
  estado: z.enum(estados),
  prioridad: z.enum(prioridades),
  categoriaId: z.uuid(),
  categoria: z.object({ id: z.uuid(), nombre: z.string() }),
  creadoEn: z.string(),
  creador: person,
  agenteId: z.string().uuid().nullable(),
  agente: person.nullable(),
});

export type Ticket = z.infer<typeof ticketSchema>;
export type Agent = z.infer<typeof person>;
export type Estado = (typeof estados)[number];
export type Prioridad = (typeof prioridades)[number];

const siguienteEstado: Record<Estado, Estado | null> = {
  ABIERTO: "EN_PROCESO",
  EN_PROCESO: "RESUELTO",
  RESUELTO: "CERRADO",
  CERRADO: null,
};

const etiquetasEstado: Record<Estado, string> = {
  ABIERTO: "Abierto",
  EN_PROCESO: "En proceso",
  RESUELTO: "Resuelto",
  CERRADO: "Cerrado",
};

export function obtenerSiguienteEstado(estado: Estado) {
  return siguienteEstado[estado];
}

export function estadoLabel(estado: Estado) {
  return etiquetasEstado[estado];
}

export async function listTickets(signal: AbortSignal) {
  const { data } = await api.get("/tareas", { signal });
  return z.array(ticketSchema).parse(data);
}

export async function getTicket(id: string, signal: AbortSignal) {
  const { data } = await api.get("/tareas/" + id, { signal });
  return ticketSchema.parse(data);
}

export async function listAgents(signal: AbortSignal) {
  const { data } = await api.get("/usuarios", {
    params: { rol: "AGENTE" },
    signal,
  });
  return z
    .array(person)
    .parse(data)
    .filter((user) => user.rol === "AGENTE");
}

export async function assignAgent(id: string, agenteId: string) {
  const { data } = await api.patch("/tareas/" + id + "/agente", { agenteId });
  const confirmed = ticketSchema.parse(data);

  if (
    confirmed.id !== id ||
    confirmed.agenteId !== agenteId ||
    confirmed.agente?.id !== agenteId
  ) {
    throw new Error("La API no confirmó la asignación solicitada");
  }

  return confirmed;
}

export async function changeTicketStatus(id: string, estado: Estado) {
  const { data } = await api.patch("/tareas/" + id + "/estado", { estado });

  const confirmed = z
    .object({
      id: z.uuid(),
      estado: z.enum(estados),
    })
    .parse(data);

  if (confirmed.id !== id || confirmed.estado !== estado) {
    throw new Error("La API no confirmó el cambio de estado solicitado");
  }

  return confirmed;
}
