
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../services/apiErrors";
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

export function Login() {
  const session = useSession((state) => state.session);
  const login = useSession((state) => state.login);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  if (session) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError("");

    try {
      await login(email, password);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "No se pudo iniciar sesión. Intenta nuevamente.",
        ),
      );
    }
  });

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 text-slate-900">
      <form
        onSubmit={onSubmit}
        noValidate
        className="grid w-full max-w-sm gap-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>

        <label className="grid gap-1">
          Correo electrónico
          <input
            className="rounded-md border border-slate-400 p-2"
            type="email"
            autoComplete="username"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />

          {errors.email && (
            <span
              id="email-error"
              role="alert"
              className="text-sm text-red-700"
            >
              {errors.email.message}
            </span>
          )}
        </label>

        <label className="grid gap-1">
          Contraseña
          <input
            className="rounded-md border border-slate-400 p-2"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "password-error" : undefined
            }
            {...register("password")}
          />

          {errors.password && (
            <span
              id="password-error"
              role="alert"
              className="text-sm text-red-700"
            >
              {errors.password.message}
            </span>
          )}
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          className="rounded-md bg-sky-800 px-4 py-2 font-semibold text-white disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
