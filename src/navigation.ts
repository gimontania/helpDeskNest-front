import type { Role } from './session'

export const roleLabels: Record<Role, string> = {
  ADMIN: 'Administrador',
  AGENTE: 'Agente',
  EMPLEADO: 'Empleado',
}

export const sections: { path: string; label: string; roles: readonly Role[] }[] = [
  { path: '/', label: 'Inicio', roles: ['ADMIN', 'AGENTE', 'EMPLEADO'] },
  { path: '/mis-tickets', label: 'Mis tickets', roles: ['EMPLEADO'] },
  { path: '/tickets/asignados', label: 'Tickets asignados', roles: ['AGENTE'] },
  { path: '/tickets', label: 'Todos los tickets', roles: ['ADMIN'] },
  { path: '/metricas', label: 'Métricas', roles: ['ADMIN'] },
  { path: '/categorias', label: 'Categorías de soporte', roles: ['ADMIN', 'AGENTE'] },
]
