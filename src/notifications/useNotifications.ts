import { useEffect } from "react";
import toast from "react-hot-toast";
import { tokenKey } from "../services/api";
import {
  createNotificationSocket,
  notificationSchema,
  NOTIFICATION_EVENT,
} from "../services/notifications";
import { useSession } from "../session";

export function useNotifications() {
  const sessionKey = useSession((state) =>
    state.session ? state.session.expiresAt : null,
  );

  useEffect(() => {
    if (sessionKey === null) return;

    const socket = createNotificationSocket(sessionStorage.getItem(tokenKey));
    if (!socket) return;

    const onNotification = (payload: unknown) => {
      const parsed = notificationSchema.safeParse(payload);
      if (!parsed.success) return;

      const { tipo, mensaje, tareaId, fecha } = parsed.data;
      // Mismo id => react-hot-toast reemplaza en vez de duplicar.
      toast(mensaje, {
        id: `notif:${tipo}:${tareaId ?? ""}:${fecha ?? mensaje}`,
        icon: "🔔",
        duration: 6000,
      });
    };

    const onConnectError = () => {
      toast("Avisos en tiempo real no disponibles por ahora.", {
        id: "realtime-unavailable",
      });
    };

    socket.on(NOTIFICATION_EVENT, onNotification);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off(NOTIFICATION_EVENT, onNotification);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [sessionKey]);
}
