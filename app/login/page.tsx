"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Factory,
  Landmark,
  MapPin,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { PERSONAS, useAuth, type Persona } from "@/lib/auth";

const PERSONA_ICONS: Record<Persona["role"], typeof Building2> = {
  hq: Building2,
  plant: Factory,
  ro: MapPin,
  dealer: Store,
  bank: Landmark,
  lsp: Truck,
};

export default function LoginPage() {
  const { role, login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Persona["role"] | null>(null);

  useEffect(() => {
    if (role) {
      router.replace(`/${role}`);
    }
  }, [role, router]);

  function handlePersonaClick(persona: Persona) {
    setSelectedRole(persona.role);
    setUsername(persona.username);
    setPassword(persona.password);
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const match = login(username, password);
    if (!match) {
      setError("Invalid credentials. Pick a persona card below to autofill a working demo login.");
      return;
    }
    router.push(`/${match.role}`);
  }

  if (role) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-canvas px-4 py-10 sm:py-16">
      <div className="w-full max-w-4xl">
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-navy text-white">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">DhanFlow</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Invoice-to-delivery visibility for Hyundai Motor India
          </p>
          <span className="mt-3 inline-flex items-center rounded-full border border-pending/30 bg-pending-bg px-3 py-1 text-xs font-medium text-pending">
            DEMO — dummy data, no real accounts
          </span>
        </header>

        <div className="grid grid-cols-1 gap-8 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8 md:grid-cols-[1.4fr_1fr]">
          <section aria-labelledby="persona-heading">
            <h2 id="persona-heading" className="text-sm font-semibold text-ink">
              Choose a persona
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Six entities, one shared vehicle record. Click a card to autofill its demo
              login, then sign in.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PERSONAS.map((persona) => {
                const Icon = PERSONA_ICONS[persona.role];
                const isSelected = selectedRole === persona.role;
                return (
                  <button
                    key={persona.role}
                    type="button"
                    onClick={() => handlePersonaClick(persona)}
                    aria-pressed={isSelected}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                      isSelected
                        ? "border-navy bg-navy-light"
                        : "border-border bg-surface hover:border-navy/40 hover:bg-navy-light/50"
                    }`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy text-white">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">
                        {persona.label}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {persona.org}
                      </span>
                      <span className="mt-1 block font-mono-vin text-[11px] text-ink-muted">
                        {persona.username} / {persona.password}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="login-heading" className="border-t border-border pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <h2 id="login-heading" className="text-sm font-semibold text-ink">
              Sign in
            </h2>
            <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-xs font-medium text-ink-muted">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                  placeholder="e.g. dealer"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-medium text-ink-muted">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                  placeholder="demo"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs font-medium text-stuck">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-1 rounded-md bg-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
              >
                Sign in
              </button>
            </form>
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Mock authentication only — no passwords are hashed, no real accounts exist.
        </p>
      </div>
    </main>
  );
}
