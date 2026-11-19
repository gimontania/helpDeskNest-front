import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { getTicket, listTickets, type Ticket } from '../services/tickets'
import { useSession } from '../session'
import { Assignment } from './Assignment'

export function TicketList() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const request = new AbortController()
    listTickets(request.signal).then(
      result => { if (!request.signal.aborted) setTickets(result) },
      () => { if (!request.signal.aborted) setError(true) },
    )
    return () => request.abort()
  }, [attempt])

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">Tickets de soporte</h1>
      {error ? <div><p role="alert">No se pudo cargar la bandeja.</p><button type="button" className="rounded border p-2"
        onClick={() => { setError(false); setAttempt(value => value + 1) }}>Reintentar</button></div>
        : tickets === null ? <p role="status">Cargando tickets…</p>
        : tickets.length === 0 ? <p role="status">No hay tickets disponibles.</p>
        : <ul className="grid gap-3 sm:grid-cols-2">
          {tickets.map(ticket => <li key={ticket.id} className="min-w-0 rounded border bg-white p-4 wrap-anywhere">
            <Link to={'/tickets/' + ticket.id} className="font-semibold text-sky-800 underline">{ticket.titulo}</Link>
            <p>{ticket.estado} · {ticket.prioridad}</p>
            <p>Responsable: {ticket.agente?.nombre ?? 'Sin asignar'}</p>
          </li>)}
        </ul>}
    </section>
  )
}

export function TicketDetail() {
  const { id = '' } = useParams()
  if (!z.uuid().safeParse(id).success) return <p role="alert">El identificador del ticket no es válido.</p>
  return <TicketContent key={id} id={id} />
}

function TicketContent({ id }: { id: string }) {
  const role = useSession(state => state.session?.role)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const request = new AbortController()
    getTicket(id, request.signal).then(
      result => { if (!request.signal.aborted) setTicket(result) },
      () => { if (!request.signal.aborted) setError(true) },
    )
    return () => request.abort()
  }, [id, attempt])

  const back = role === 'EMPLEADO' ? '/mis-tickets' : '/tickets'
  if (error) return <div><p role="alert">No se pudo cargar el ticket.</p><button type="button" className="rounded border p-2"
    onClick={() => { setError(false); setAttempt(value => value + 1) }}>Reintentar</button></div>
  if (!ticket) return <p role="status">Cargando ticket…</p>
  return (
    <section className="grid min-w-0 gap-4 wrap-anywhere">
      <Link to={back} className="text-sky-800 underline">Volver a la bandeja</Link>
      <h1 className="text-2xl font-bold">{ticket.titulo}</h1>
      <p className="whitespace-pre-wrap">{ticket.descripcion}</p>
      <p>{ticket.estado} · {ticket.prioridad}</p>
      <p>Responsable: <strong>{ticket.agente?.nombre ?? 'Sin asignar'}</strong></p>
      {(role === 'ADMIN' || role === 'AGENTE') && <Assignment ticket={ticket} onAssigned={setTicket} />}
    </section>
  )
}
