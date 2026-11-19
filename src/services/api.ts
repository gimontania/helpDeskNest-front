
import axios from "axios";

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

// Agrega automáticamente el JWT a las peticiones.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(tokenKey);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Centraliza el comportamiento de las respuestas HTTP.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      sessionStorage.getItem(tokenKey)
    ) {
      onUnauthorized();
    }

    return Promise.reject(error);
  },
);

export default api;
