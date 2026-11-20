import { z } from "zod";
import api from "./api";

const commentSchema = z.object({
  id: z.uuid(),
  contenido: z.string(),
  creadoEn: z.iso.datetime({ offset: true }),
  autor: z.object({ id: z.uuid(), nombre: z.string(), rol: z.string() }),
});
export type Comment = z.infer<typeof commentSchema>;

export async function listComments(ticketId: string, signal: AbortSignal) {
  const { data } = await api.get("/tareas/" + ticketId + "/comentarios", {
    signal,
  });
  return z.array(commentSchema).parse(data);
}

export async function createComment(ticketId: string, contenido: string) {
  const { data } = await api.post("/tareas/" + ticketId + "/comentarios", {
    contenido,
  });
  return commentSchema.parse(data);
}
