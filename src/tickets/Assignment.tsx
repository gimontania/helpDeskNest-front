import { useEffect, useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../services/apiErrors";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  SuccessState,
} from "../feedback/States";
import {
  listAgents,
  assignAgent,
  type Agent,
  type Ticket,
} from "../services/tickets";
import toast from "react-hot-toast";

export function Assignment({
  ticket,
  onAssigned,
}: {
  ticket: Ticket;
  onAssigned: (ticket: Ticket) => void;
}) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const request = new AbortController();
    listAgents(request.signal).then(
      (result) => {
        if (request.signal.aborted) return;
        setAgents(result);
        setLoading(false);
      },
      () => {
        if (request.signal.aborted) return;
        setLoadError(true);
        setLoading(false);
      },
    );
    return () => request.abort();
  }, [attempt]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (
      saving ||
      !agents.some((agent) => agent.id === selected) ||
      selected === ticket.agenteId
    )
      return;
    setSaving(true);
    setError("");
    try {
      const confirmed = await assignAgent(ticket.id, selected);
      onAssigned(confirmed);
      setSelected("");
      toast.success("Responsable actualizado.", { id: "assign-success" });
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState message="Cargando agentes elegibles…" />;
  if (loadError)
    return (
      <ErrorState
        message="No se pudieron cargar los agentes."
        onRetry={() => {
          setLoading(true);
          setLoadError(false);
          setAttempt((value) => value + 1);
        }}
      />
    );
  if (agents.length === 0)
    return <EmptyState message="No hay agentes elegibles disponibles." />;

  return (
    <form onSubmit={submit} className="grid max-w-lg gap-3">
      <label className="grid gap-1">
        Asignar responsable
        <select
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value);
            setError("");
          }}
          disabled={saving}
          required
          className="min-w-0 rounded border bg-white p-2"
        >
          <option value="">Selecciona un agente</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.nombre} ({agent.email})
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={saving || !selected || selected === ticket.agenteId}
        className="rounded bg-sky-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Asignando…" : "Asignar responsable"}
      </button>
      {error && (
        <ErrorState
          message={error}
          onRetry={() => void submit()}
          disabled={saving}
        />
      )}
      {message && <SuccessState message={message} />}
      {saving && <LoadingState message="Asignando responsable…" />}
    </form>
  );
}
