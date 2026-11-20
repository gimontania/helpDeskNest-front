
import { z } from "zod";
import api from "./api";
import type { CreateTicketFormValues } from "../schemas/createTicketSchema";

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
  estado: z.string(),
  prioridad: z.string(),
  agenteId: z.uuid().nullable(),
  agente: person.nullable(),
});

export type Ticket = z.infer<typeof ticketSchema>;
export type Agent = z.infer<typeof person>;

export async function listTickets(signal: AbortSignal) {
  const { data } = await api.get("/tareas", { signal });
  return z.array(ticketSchema).parse(data);
}

export async function getTicket(id: string, signal: AbortSignal) {
  const { data } = await api.get("/tareas/" + id, { signal });
  return ticketSchema.parse(data);
}

export async function createTicket(values: CreateTicketFormValues): Promise<void> {
  await api.post("/tareas", {
    titulo: values.titulo,
    descripcion: values.descripcion,
    prioridad: values.prioridad,
    categoriaId: values.categoriaId,
  });
}

export async function listAgents(signal: AbortSignal) {
  const { data } = await api.get("/usuarios", {
    params: { rol: "AGENTE" },
    signal,
  });

  return z.array(person).parse(data).filter((user) => user.rol === "AGENTE");
}

export async function assignAgent(id: string, agenteId: string) {
  const { data } = await api.patch("/tareas/" + id + "/agente", {
    agenteId,
  });

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
