import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { Login } from "./components/Login";
import { Categorias } from "./components/Categorias";
import { TicketList, TicketDetail } from "./tickets/Tickets";
import { CreateTicket } from "./tickets/CreateTicket";
import { sections } from "./navigation";
import { useSession } from "./session";

function AccessDenied() {
  return (
    <section className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-red-700">
        403 - Acceso denegado
      </h1>
      <p className="mt-3 text-slate-600">
        No tienes permisos para acceder a esta sección.
      </p>
      <p className="mt-2 text-sm text-slate-500">
        Tu sesión continúa activa.
      </p>
    </section>
  );
}

function App() {
  const session = useSession((state) => state.session);
  const logout = useSession((state) => state.logout);
  const role = session?.role;

  useEffect(() => {
    if (!session) return;

    const checkExpiry = () => {
      if (session.expiresAt <= Date.now()) logout();
    };

    const timer = window.setInterval(checkExpiry, 1_000);
    window.addEventListener("focus", checkExpiry);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", checkExpiry);
    };
  }, [session, logout]);

  return (
    <>
      <Toaster />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          {sections.map(({ path, label, roles }) => {
            if (!role || !roles.includes(role)) {
              return (
                <Route
                  key={path}
                  path={path}
                  element={<AccessDenied />}
                />
              );
            }

            let element;

            if (path === "/tickets" || path === "/mis-tickets") {
              element = <TicketList />;
            } else if (path === "/tickets/nuevo") {
              element = <CreateTicket />;
            } else if (path === "/categorias") {
              element = <Categorias />;
            } else {
              element = (
                <>
                  <h1 className="text-2xl font-bold">{label}</h1>
                  {path !== "/" && (
                    <p className="mt-2 text-slate-600">
                      Esta sección está pendiente de implementación.
                    </p>
                  )}
                </>
              );
            }

            return (
              <Route
                key={path}
                path={path}
                element={element}
              />
            );
          })}

          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
