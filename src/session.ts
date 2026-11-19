
import { create } from "zustand";
import api, {
  setUnauthorizedHandler,
  tokenKey as storageKey,
} from "./services/api";

const roles = ["ADMIN", "AGENTE", "EMPLEADO"] as const;
export type Role = (typeof roles)[number];

type Session = {
  email: string;
  role: Role;
  expiresAt: number;
};

function restoreSession(): Session | null {
  const token = sessionStorage.getItem(storageKey);
  const session = token ? readToken(token) : null;

  if (token && !session) {
    sessionStorage.removeItem(storageKey);
  }

  return session;
}

function readToken(token: string): Session | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3 || !parts[1]) {
      return null;
    }

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "=",
    );

    const claims = JSON.parse(atob(padded));

    if (
      !roles.includes(claims.rol) ||
      typeof claims.email !== "string" ||
      !Number.isFinite(claims.exp) ||
      claims.exp * 1000 <= Date.now()
    ) {
      return null;
    }

    return {
      email: claims.email,
      role: claims.rol,
      expiresAt: claims.exp * 1000,
    };
  } catch {
    return null;
  }
}

export const useSession = create<{
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}>((set) => ({
  session: restoreSession(),

  async login(email, password) {
    const { data } = await api.post<{ access_token: string }>(
      "/auth/login",
      { email, password },
    );

    const session = readToken(data.access_token);

    if (!session) {
      throw new Error("La API devolvió un token inválido o vencido.");
    }

    sessionStorage.setItem(storageKey, data.access_token);
    set({ session });
  },

  logout() {
    sessionStorage.removeItem(storageKey);
    set({ session: null });
  },
}));

setUnauthorizedHandler(() => useSession.getState().logout());
