import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { Login } from './components/Login'
import { sections } from './navigation'
import { useSession } from './session'

function App() {
  const session = useSession((state) => state.session)
  const logout = useSession((state) => state.logout)
  const role = session?.role

  useEffect(() => {
    if (!session) return
    const checkExpiry = () => {
      if (session.expiresAt <= Date.now()) logout()
    }
    const timer = window.setInterval(checkExpiry, 1_000)
    window.addEventListener('focus', checkExpiry)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', checkExpiry)
    }
  }, [session, logout])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        {sections.map(({ path, label, roles }) => (
          <Route key={path} path={path} element={role && roles.includes(role) ? (
            <>
              <h1 className="text-2xl font-bold">{label}</h1>
              {path !== '/' && <p className="mt-2 text-slate-600">Esta sección está pendiente de implementación.</p>}
            </>
          ) : <Navigate to="/" replace />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
