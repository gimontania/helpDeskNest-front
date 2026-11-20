import { io, type Socket } from "socket.io-client";
import { z } from "zod";

export const notificationSchema = z.object({
  tipo: z.string(),
  mensaje: z.string().min(1),
  tareaId: z.string().optional(),
  datos: z.record(z.string(), z.unknown()).optional(),
  fecha: z.string().optional(),
});

export type Notification = z.infer<typeof notificationSchema>;

export const NOTIFICATIONS_NAMESPACE = "/notificaciones";
export const NOTIFICATION_EVENT = "notificacion";

function socketBaseUrl(): string | null {
  const url = (
    import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL
  )?.trim();
  return url ? url.replace(/\/+$/, "") : null;
}

/**
 * Crea (sin conectar de inmediato el ciclo de vida) el socket de avisos.
 * Devuelve null si no hay URL configurada o token: así solo se conecta
 * cuando existe soporte y sesión.
 */
export function createNotificationSocket(token: string | null): Socket | null {
  const base = socketBaseUrl();
  if (!base || !token) return null;

  return io(base + NOTIFICATIONS_NAMESPACE, {
    auth: { token },
    reconnectionAttempts: 10,
  });
}
