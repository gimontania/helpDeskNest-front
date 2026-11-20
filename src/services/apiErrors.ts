import { isAxiosError } from "axios";

export class ApiError extends Error {
  status?: number;
  fields: Record<string, string>;
  retryable: boolean;

  constructor(
    message: string,
    status?: number,
    fields: Record<string, string> = {},
    retryable = true,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
    this.retryable = retryable;
  }
}
const fieldLabels: Record<string, string> = {
  nombre: "el nombre",
  descripcion: "la descripción",
  titulo: "el título",
  prioridad: "la prioridad",
  categoriaId: "la categoría",
  agenteId: "el responsable",
  contenido: "el comentario",
  email: "el correo",
  password: "la contraseña",
};

export function normalizeApiError(
  error: unknown,
  fallback = "No se pudo completar la operación. Intenta de nuevo.",
): ApiError {
  if (error instanceof ApiError) return error;
  if (!isAxiosError(error)) return new ApiError(fallback);
  if (!error.response) {
    return new ApiError(
      error.code === "ECONNABORTED"
        ? "El servidor tardó demasiado en responder. Intenta de nuevo."
        : "No se pudo conectar con el servidor. Comprueba tu conexión.",
    );
  }

  const status = error.response.status;
  const fields: Record<string, string> = {};
  if (status === 400 || status === 422) {
    const body = error.response.data;
    const details: unknown = body?.details ?? body?.message;
    const messages = Array.isArray(details) ? details : [details];
    for (const [field, label] of Object.entries(fieldLabels)) {
      if (
        messages.some(
          (message) =>
            typeof message === "string" &&
            message.toLowerCase().startsWith(field.toLowerCase() + " "),
        )
      ) {
        fields[field] = "Revisa " + label + ".";
      }
    }
  }

  const messages: Record<number, string> = {
    400: "Revisa los datos del formulario.",
    401: "El correo o la contraseña son incorrectos, o la sesión ya no es válida.",
    403: "No tienes permisos para realizar esta operación.",
    404: "No se encontró el recurso solicitado.",
    409: "Los datos cambiaron o están relacionados con otros registros. Revisa la información e intenta de nuevo.",
    422: "Revisa los datos del formulario.",
    429: "Hay demasiadas solicitudes. Espera un momento y vuelve a intentar.",
  };
  return new ApiError(
    messages[status] ??
      (status >= 500
        ? "El servicio no está disponible. Intenta de nuevo."
        : fallback),
    status,
    fields,
    ![400, 401, 403, 404, 422].includes(status),
  );
}

export function getApiErrorMessage(error: unknown, fallback?: string): string {
  return normalizeApiError(error, fallback).message;
}
