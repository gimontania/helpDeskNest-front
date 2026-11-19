
import { isAxiosError } from "axios";

type ApiErrorResponse = {
  message?: string | string[];
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error inesperado.",
): string {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  // El servidor no respondió: conexión, CORS o timeout.
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return "El servidor tardó demasiado en responder.";
    }

    return "No se pudo conectar con el servidor. Comprueba tu conexión.";
  }

  const status = error.response.status;
  const serverMessage = error.response.data?.message;

  switch (status) {
    case 400:
      if (Array.isArray(serverMessage)) {
        return serverMessage.join(". ");
      }

      return serverMessage || "La solicitud contiene datos inválidos.";

    case 401:
      return "El correo o la contraseña son incorrectos, o la sesión ya no es válida.";

    case 403:
      return "No tienes permisos para realizar esta operación.";

    case 404:
      return "No se encontró el recurso solicitado.";

    case 409:
        if (Array.isArray(serverMessage)) {
            return serverMessage.join(". ");
        }

        return serverMessage || "La operación presenta un conflicto.";

    case 500:
    case 502:
    case 503:
    case 504:
      return "El servidor presenta un problema. Intenta nuevamente.";

    default:
      if (typeof serverMessage === "string") {
        return serverMessage;
      }

      return fallback;
  }
}
