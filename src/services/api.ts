import axios from "axios";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "./apiErrors";

export const tokenKey = "helpdesknest.access_token";

const configuredUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredUrl) {
  throw new Error(
    "Falta configurar VITE_API_URL. Revisa el archivo .env.local.",
  );
}

let apiUrl: URL;

try {
  apiUrl = new URL(configuredUrl);
} catch {
  throw new Error("VITE_API_URL no contiene una URL válida.");
}

if (apiUrl.protocol !== "http:" && apiUrl.protocol !== "https:") {
  throw new Error("VITE_API_URL debe utilizar HTTP o HTTPS.");
}

const api = axios.create({
  baseURL: configuredUrl.replace(/\/+$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

let onUnauthorized: () => void = () => {};

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(tokenKey);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const hadSession = !!sessionStorage.getItem(tokenKey);

      if (status === 401 && hadSession) {
        onUnauthorized();
        toast.error("Tu sesión expiró. Inicia sesión de nuevo.", {
          id: "session-expired",
        });
      } else if (status === 403) {
        toast.error(
          "Acceso denegado: no tienes permisos para esta operación.",
          { id: "forbidden" },
        );
      } else if (!error.response && !axios.isCancel(error)) {
        toast.error(getApiErrorMessage(error), { id: "network-error" });
      }
    }
    return Promise.reject(error);
  },
);

export default api;
