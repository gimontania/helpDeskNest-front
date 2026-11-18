import { create } from 'zustand'
import api from './services/api'

const roles = ['ADMIN', 'AGENTE', 'EMPLEADO'] as const
export type Role = (typeof roles)[number]

type Session = { email: string; role: Role; expiresAt: number }
const storageKey = 'helpdesknest.access_token'

function readToken(token: string): Session | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const claims = JSON.parse(atob(payload))
    if (!roles.includes(claims.rol) || typeof claims.email !== 'string' ||
        !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) return null
    return { email: claims.email, role: claims.rol, expiresAt: claims.exp * 1000 }
  } catch {
    return null
  }
}

export const useSession = create<{
  session: Session | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}>((set) => ({
  session: readToken(sessionStorage.getItem(storageKey) ?? ''),
  async login(email, password) {
    const { data } = await api.post<{ access_token: string }>('/auth/login', { email, password })
    const session = readToken(data.access_token)
    if (!session) throw new Error('Sesión inválida')
    sessionStorage.setItem(storageKey, data.access_token)
    set({ session })
  },
  logout() {
    sessionStorage.removeItem(storageKey)
    set({ session: null })
  },
}))
