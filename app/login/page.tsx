"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PERSONAS, useAuth, type Persona } from "@/lib/auth";
import PersonaIcon from "@/components/PersonaIcon";

/**
 * The poster. This page is the first thing the panel sees, and the place the
 * persona → hue mapping is learned before the first login.
 */
export default function LoginPage() {
  const { role, login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Persona["role"] | null>(null);

  useEffect(() => {
    document.title = "DhanFlow — Sign in";
  }, []);

  useEffect(() => {
    if (role) router.replace(`/${role}`);
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
      setError("Those credentials don't match a demo account. Pick a persona to autofill.");
      return;
    }
    router.push(`/${match.role}`);
  }

  if (role) return null;

  return (
    <main className="flex min-h-screen flex-col bg-navy text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-10 lg:flex-row lg:items-center lg:gap-14 lg:py-16">
        <section className="lg:w-[42%]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
              D
            </span>
            <span className="font-display text-xl leading-none tracking-tight">DhanFlow</span>
          </div>

          <h1 className="font-display mt-8 text-[34px] leading-[1.1] tracking-tight sm:text-[44px]">
            One record.
            <br />
            Every party.
            <br />
            No phone calls.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
            Invoice-to-delivery visibility for Hyundai Motor India — the plant, the regional
            office, the dealer and the transporter all reading the same vehicle record and the
            same documents, each seeing exactly their own slice of it.
          </p>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {[
              { k: "5", v: "entities" },
              { k: "1", v: "shared record" },
              { k: "0", v: "phone calls" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-3xl leading-none tabular-nums">{s.k}</dt>
                <dd className="mt-1 text-xs text-white/60">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="lg:w-[58%]" aria-labelledby="persona-heading">
          <h2 id="persona-heading" className="text-sm font-semibold">
            Choose a persona
          </h2>
          <p className="mt-1 text-xs text-white/60">
            Each entity has its own colour, its own question, and its own slice of the record.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PERSONAS.map((persona) => {
              const isSelected = selectedRole === persona.role;
              return (
                <button
                  key={persona.role}
                  type="button"
                  data-role={persona.role}
                  onClick={() => handlePersonaClick(persona)}
                  aria-pressed={isSelected}
                  className={`group relative flex items-start gap-3 overflow-hidden rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-[color:var(--role-hue)] bg-white/10"
                      : "border-white/15 bg-white/[0.04] hover:border-[color:var(--role-hue)] hover:bg-white/[0.08]"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 bg-role opacity-70"
                  />
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold bg-role">
                    {persona.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{persona.name}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-white/70">
                      <PersonaIcon role={persona.role} className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{persona.title}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-white/50">
                      {persona.org}, {persona.location}
                    </span>
                    <span className="font-mono-vin mt-1.5 block text-[11px] text-white/45">
                      {persona.username} / {persona.password}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <form
            className="mt-5 flex flex-col gap-3 rounded-xl border border-white/15 bg-white/[0.04] p-4 sm:flex-row sm:items-end"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-medium text-white/70">
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
                placeholder="dealer"
                className="font-mono-vin min-h-11 rounded-lg border border-white/20 bg-navy px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/50"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-white/70">
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
                placeholder="demo"
                className="font-mono-vin min-h-11 rounded-lg border border-white/20 bg-navy px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/50"
              />
            </div>
            <button
              type="submit"
              className="flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white px-5 text-sm font-semibold text-navy transition-colors hover:bg-white/90"
            >
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-2 text-xs font-medium text-white">
              {error}
            </p>
          )}

          <p className="mt-4 text-xs text-white/50">
            Access is scoped to the entity you sign in as — every screen reads the same record
            through that entity&apos;s permissions.
          </p>
        </section>
      </div>
    </main>
  );
}
