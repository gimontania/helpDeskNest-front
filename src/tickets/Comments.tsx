import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  listComments,
  createComment,
  type Comment,
} from "../services/comments";
import { getApiErrorMessage, normalizeApiError } from "../services/apiErrors";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  SuccessState,
} from "../feedback/States";

export function Comments({ ticketId }: { ticketId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [content, setContent] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const busy = useRef(false);

  useEffect(() => {
    const request = new AbortController();
    listComments(ticketId, request.signal).then(
      (result) => {
        if (!request.signal.aborted) {
          setComments(result);
          setLoading(false);
        }
      },
      (error) => {
        if (!request.signal.aborted) {
          setLoadError(getApiErrorMessage(error));
          setLoading(false);
        }
      },
    );
    return () => request.abort();
  }, [ticketId, attempt]);

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (busy.current) return;
    setSuccess("");
    setSaveError("");
    if (!content.trim()) {
      setFieldError("Escribe un comentario.");
      return;
    }
    setFieldError("");
    busy.current = true;
    setSaving(true);
    try {
      const confirmed = await createComment(ticketId, content.trim());
      setComments((current) => [
        ...current.filter((comment) => comment.id !== confirmed.id),
        confirmed,
      ]);
      setContent("");
      setSuccess("Comentario publicado.");
    } catch (error) {
      const normalized = normalizeApiError(error);
      setSaveError(normalized.message);
      setFieldError(normalized.fields.contenido ?? "");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="comments-title" className="grid gap-4">
      <h2 id="comments-title" className="text-lg font-semibold">
        Comentarios
      </h2>
      {loading && <LoadingState message="Cargando comentarios…" />}
      {loadError && (
        <ErrorState
          message={loadError}
          onRetry={() => {
            setLoading(true);
            setLoadError("");
            setAttempt((value) => value + 1);
          }}
        />
      )}
      {!loading && !loadError && comments.length === 0 && (
        <EmptyState message="Todavía no hay comentarios." />
      )}
      <ul className="grid gap-3">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="rounded-lg border border-slate-700 p-3"
          >
            <p className="font-semibold">{comment.autor.nombre}</p>
            <p className="whitespace-pre-wrap wrap-anywhere">
              {comment.contenido}
            </p>
            <time
              dateTime={comment.creadoEn}
              className="text-xs text-slate-500"
            >
              {new Date(comment.creadoEn).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} noValidate className="grid gap-3">
        <label className="grid gap-1">
          Comentario
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setSuccess("");
            }}
            disabled={saving}
            aria-invalid={!!fieldError}
            aria-describedby={fieldError ? "comment-error" : undefined}
            className="rounded-lg border border-slate-500 bg-transparent p-3"
            rows={3}
          />
        </label>
        {fieldError && (
          <p id="comment-error" role="alert" className="text-sm text-rose-500">
            {fieldError}
          </p>
        )}
        {saveError && (
          <ErrorState
            message={saveError}
            onRetry={() => void submit()}
            disabled={saving}
          />
        )}
        {saving && <LoadingState message="Publicando comentario…" />}
        {success && <SuccessState message={success} />}
        <button
          type="submit"
          disabled={saving || loading || !!loadError}
          className="rounded-lg bg-sky-700 px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Publicando…" : "Publicar comentario"}
        </button>
      </form>
    </section>
  );
}
