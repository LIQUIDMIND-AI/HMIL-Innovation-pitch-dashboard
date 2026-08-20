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
  /** The human at the keyboard — shown in the persona bar and greeting. */
  name: string;
  initials: string;
  /** Job title, e.g. "Dealer Principal". */
  title: string;
  /** Short label for the role itself, e.g. "Dealer". */
  label: string;
  /** The organisation this persona belongs to. */
  org: string;
  /** City / site, appended after the org in the greeting line. */
  location: string;
  /** The one question this persona opens the app to answer. */
  question: string;
  username: string;
  password: string;
}

/** The 5 hardcoded demo accounts. Credentials are shown on the login screen itself — this is a demo. */
export const PERSONAS: Persona[] = [
  {
    role: "hq",
    name: "Ananya Sharma",
    initials: "AS",
    title: "GM, Sales Logistics",
    label: "HMIL Sales Logistics (HQ)",
    org: "Sales Logistics HQ",
    location: "Gurugram",
    question: "Where is the national pipeline stuck right now?",
    username: "hq",
    password: "demo",
  },
  {
    role: "plant",
    name: "Suresh Iyer",
    initials: "SI",
    title: "Dispatch Desk Lead",
    label: "Plant / Dispatch Desk",
    org: "Sriperumbudur Plant",
    location: "Tamil Nadu",
    question: "Which cars can I gate-out today?",
    username: "plant",
    password: "demo",
  },
  {
    role: "ro",
    name: "Rakesh Mehta",
    initials: "RM",
    title: "Regional Manager",
    label: "Regional Office",
    org: "Chandigarh RO",
    location: "Chandigarh",
    question: "Which of my dealers is bleeding days?",
    username: "ro",
    password: "demo",
  },
  {
    role: "dealer",
    name: "Rajesh Bansal",
    initials: "RB",
    title: "Dealer Principal",
    label: "Dealer",
    org: "Krishna Hyundai",
    location: "Chandigarh",
    question: "How many of my cars are at risk?",
    username: "dealer",
    password: "demo",
  },
  {
    role: "lsp",
    name: "Vikram Singh",
    initials: "VS",
    title: "Fleet Controller",
    label: "LSP / Transporter",
    org: "Speedline Logistics",
    location: "Chennai",
    question: "Which trip is running late?",
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

/**
 * False on the hydration render, true from the first client effect onward.
 *
 * The session role is read from sessionStorage, so the server snapshot is
 * always `null`. Route guards must not act on that first `null` — doing so
 * bounces a hard refresh of any deep URL (say `/dealer/tracking`) out to the
 * login page and back to the role home. Gate the redirect on this instead.
 */
const noopSubscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
