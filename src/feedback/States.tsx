import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Cargando…" }: { message?: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 py-3 text-sm text-slate-400"
    >
      <Loader2 aria-hidden="true" className="h-4 w-4 shrink-0 animate-spin" />
      {message}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = "Reintentar",
  disabled = false,
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="grid justify-items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-950 p-3">
      <p role="alert" className="text-sm text-rose-200">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          disabled={disabled}
          onClick={onRetry}
          className="rounded-lg border border-rose-400/50 px-3 py-2 text-sm text-rose-200 disabled:opacity-50"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-dashed border-slate-500/50 p-4 text-sm text-slate-500"
    >
      {message}
    </p>
  );
}

export function SuccessState({ message }: { message: string }) {
  return (
    <p
      role="status"
      className="rounded-lg bg-emerald-950 p-3 text-sm text-emerald-200"
    >
      {message}
    </p>
  );
}
