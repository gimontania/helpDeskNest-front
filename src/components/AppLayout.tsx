import { useEffect, useRef } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { roleLabels, sections } from '../navigation'
import { useSession, type Role } from '../session'

function Navigation({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  return (
    <nav aria-label="Secciones">
      <ul className="grid gap-1">
        {sections.filter((section) => section.roles.includes(role)).map(({ path, label }) => (
          <li key={path}>
            <NavLink end to={path} onClick={onNavigate}
              className={({ isActive }) => 'block rounded-lg border-l-4 px-3 py-2.5 ' +
                (isActive ? 'border-sky-700 bg-sky-100 font-semibold text-sky-950' : 'border-transparent hover:bg-slate-100')}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
      <Navigation role={role} />
    </aside>
  )
}

function Navbar({ role }: { role: Role }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const location = useLocation()
  const logout = useSession((state) => state.logout)

  useEffect(() => { dialog.current?.close() }, [location.key])

  useEffect(() => {
    const desktop = matchMedia('(min-width: 48rem)')
    const closeOnDesktop = () => {
      if (desktop.matches) dialog.current?.close()
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <button type="button" aria-haspopup="dialog" aria-controls="mobile-navigation"
          className="rounded-md border border-slate-300 px-3 py-2 md:hidden"
          onClick={() => dialog.current?.showModal()}>Menú</button>
        <div>
          <div className="font-bold text-slate-950">HelpDeskNest</div>
          <div className="text-sm text-slate-600">{roleLabels[role]}</div>
        </div>
      </div>
      <button type="button" onClick={logout} className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-100">
        Cerrar sesión
      </button>
      <dialog id="mobile-navigation" ref={dialog} aria-labelledby="mobile-navigation-title"
        className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-white p-4 text-slate-900 backdrop:bg-slate-950/50">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="mobile-navigation-title" className="font-bold">Menú</h2>
          <button type="button" className="rounded-md border border-slate-300 px-3 py-2"
            onClick={() => dialog.current?.close()}>Cerrar menú</button>
        </div>
        <Navigation role={role} onNavigate={() => dialog.current?.close()} />
      </dialog>
    </header>
  )
}

export function AppLayout() {
  const session = useSession((state) => state.session)
  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar role={session.role} />
      <div className="flex flex-1">
        <Sidebar role={session.role} />
        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
