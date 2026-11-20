import { TicketDetail } from "./tickets/Tickets";
import { TicketList } from "./tickets/TicketList";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { Login } from "./components/Login";
import { sections } from "./navigation";
import { useSession } from "./session";
import { Categorias } from "./components/Categorias";
import { Metricas } from "./metrics/Metricas";

function AccessDenied() {
  return (
    <section className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-6">
      <h1 className="text-2xl font-bold text-red-700">403 - Acceso denegado</h1>
      <p className="mt-3 text-slate-600">
        No tenés permisos para acceder a esta sección.
      </p>
      <p className="mt-2 text-sm text-slate-500">Tu sesión continúa activa.</p>
    </section>
  );
}

function renderSection(path: string, label: string) {
  switch (path) {
    case "/tickets":
    case "/mis-tickets":
      return <TicketList />;
    case "/categorias":
      return <Categorias />;
    case "/metricas":
      return <Metricas />;
    default:
      return (
        <>
          <h1 className="text-2xl font-bold text-white">{label}</h1>
          {path !== "/" && (
            <p className="mt-2 text-slate-400">
              Esta sección está pendiente de implementación.
            </p>
          )}
        </>
      );
  }
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
                <Route key={path} path={path} element={<AccessDenied />} />
              );
            }
            return (
              <Route
                key={path}
                path={path}
                element={renderSection(path, label)}
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
