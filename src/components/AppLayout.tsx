import { Headset, LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { roleLabels, sections } from "../navigation";
import { useSession } from "../session";

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const session = useSession((s) => s.session);
  const logout = useSession((s) => s.logout);
  if (!session) return null;

  const items = sections.filter((s) => s.roles.includes(session.role));
  const initial = session.email.charAt(0).toUpperCase() || "U";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/20">
            <Headset className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-white">HelpDeskNest</p>
            <p className="text-xs text-slate-500">{roleLabels[session.role]}</p>
          </div>
        </div>

        <nav
          aria-label="Secciones"
          className="flex-1 space-y-1 overflow-y-auto px-3 py-2"
        >
          <p className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menú
          </p>
          {items.map(({ path, label }) => (
            <NavLink
              key={path}
              end
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-cyan-500 text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-200">
                {session.email}
              </p>
              <p className="text-xs text-slate-500">Sesión activa</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-rose-400"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function AppLayout() {
  const session = useSession((s) => s.session);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  if (!session) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-cyan-500">
              <Headset className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">
              HelpDeskNest
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
