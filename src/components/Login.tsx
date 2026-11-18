import { isAxiosError } from 'axios'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../session'

export function Login() {
  const session = useSession((state) => state.session)
  const login = useSession((state) => state.login)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  if (session) return <Navigate to="/" replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const fields = new FormData(event.currentTarget)
    setError('')
    setPending(true)
    try {
      await login(String(fields.get('email')).trim(), String(fields.get('password')))
    } catch (error) {
      setError(isAxiosError(error) && error.response?.status === 401
        ? 'El correo o la contraseña son incorrectos.'
        : 'No se pudo iniciar sesión. Intenta de nuevo.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 text-slate-900">
      <form onSubmit={submit} className="grid w-full max-w-sm gap-4 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <label className="grid gap-1">
          Correo electrónico
          <input className="rounded-md border border-slate-400 p-2" name="email" type="email" autoComplete="username" required />
        </label>
        <label className="grid gap-1">
          Contraseña
          <input className="rounded-md border border-slate-400 p-2" name="password" type="password" autoComplete="current-password" required />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button className="rounded-md bg-sky-800 px-4 py-2 font-semibold text-white disabled:opacity-60"
          type="submit" disabled={pending}>{pending ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </main>
  )
}
