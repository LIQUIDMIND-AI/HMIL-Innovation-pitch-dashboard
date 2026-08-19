"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Role } from "./types";

export interface Persona {
  role: Role;
  label: string;
  org: string;
  username: string;
  password: string;
}

/** The 6 hardcoded demo accounts. Credentials are shown on the login screen itself — this is a demo. */
export const PERSONAS: Persona[] = [
  {
    role: "hq",
    label: "HMIL Sales Logistics (HQ)",
    org: "Sales Logistics HQ",
    username: "hq",
    password: "demo",
  },
  {
    role: "plant",
    label: "Plant / Dispatch Desk",
    org: "Sriperumbudur Plant",
    username: "plant",
    password: "demo",
  },
  {
    role: "ro",
    label: "Regional Office",
    org: "Chandigarh RO",
    username: "ro",
    password: "demo",
  },
  {
    role: "dealer",
    label: "Dealer",
    org: "Krishna Hyundai, Chandigarh",
    username: "dealer",
    password: "demo",
  },
  {
    role: "bank",
    label: "Bank",
    org: "HDFC Dealer-Finance Desk",
    username: "bank",
    password: "demo",
  },
  {
    role: "lsp",
    label: "LSP / Transporter",
    org: "Speedline Logistics",
    username: "lsp",
    password: "demo",
  },
];

const SESSION_KEY = "dhanflow.role";

/**
 * Minimal external store over sessionStorage, read through useSyncExternalStore.
 * This keeps the session role in sync with the browser session without an
 * effect + setState round trip, and — unlike an effect — resolves to the real
 * client value before paint, so there's no "loading" flash and no hydration
 * mismatch to guard against.
 */
type Listener = () => void;
let listeners: Listener[] = [];
let cachedRole: Role | null | undefined;

function readStoredRole(): Role | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem(SESSION_KEY);
  return PERSONAS.some((p) => p.role === stored) ? (stored as Role) : null;
}

function subscribe(listener: Listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Role | null {
  if (cachedRole === undefined) cachedRole = readStoredRole();
  return cachedRole;
}

function getServerSnapshot(): Role | null {
  return null;
}

function setStoredRole(role: Role | null) {
  cachedRole = role;
  if (typeof window !== "undefined") {
    if (role) window.sessionStorage.setItem(SESSION_KEY, role);
    else window.sessionStorage.removeItem(SESSION_KEY);
  }
  listeners.forEach((l) => l());
}

interface AuthContextValue {
  role: Role | null;
  persona: Persona | null;
  login: (username: string, password: string) => Persona | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const role = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback((username: string, password: string) => {
    const normalized = username.trim().toLowerCase();
    const match = PERSONAS.find(
      (p) => p.username === normalized && p.password === password
    );
    if (!match) return null;
    setStoredRole(match.role);
    return match;
  }, []);

  const logout = useCallback(() => {
    setStoredRole(null);
  }, []);

  const persona = useMemo(
    () => (role ? PERSONAS.find((p) => p.role === role) ?? null : null),
    [role]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ role, persona, login, logout }),
    [role, persona, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
