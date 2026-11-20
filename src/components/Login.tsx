import { ErrorState, LoadingState } from "../feedback/States";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Headset, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { normalizeApiError } from "../services/apiErrors";
import { useSession } from "../session";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo.")
    .email("Correo electrónico inválido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-900/60 py-3 pl-11 pr-3.5 text-sm text-slate-100 transition-colors placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 aria-[invalid=true]:border-rose-500/60";

export function Login() {
  const session = useSession((state) => state.session);
  const login = useSession((state) => state.login);
  const [error, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (session) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setApiError("");

    try {
      await login(email, password);
    } catch (err) {
      const normalized = normalizeApiError(err);
      for (const field of ["email", "password"] as const) {
        if (normalized.fields[field])
          setError(field, { message: normalized.fields[field] });
      }
      setApiError(normalized.message);
    }
  });

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/30">
            <Headset className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">HelpDeskNest</h1>
          <p className="mt-1 text-sm text-slate-400">
            Inicia sesión para gestionar tus tickets
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-7 shadow-2xl backdrop-blur-xl"
        >
          <div>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                placeholder="correo@empresa.com"
                autoComplete="username"
                aria-label="Correo electrónico"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={inputClass}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="mt-1.5 text-xs text-rose-300"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                placeholder="Contraseña"
                autoComplete="current-password"
                aria-label="Contraseña"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={inputClass}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p
                id="password-error"
                role="alert"
                className="mt-1.5 text-xs text-rose-300"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {isSubmitting && <LoadingState message="Iniciando sesión…" />}
          {error && (
            <ErrorState
              message={error}
              onRetry={() => void onSubmit()}
              disabled={isSubmitting}
            />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Ingresar <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
