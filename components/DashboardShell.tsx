"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getGreetingWord, getPersonaHeadline } from "@/lib/selectors";
import { faviconDataUri } from "@/lib/roleTheme";
import Sidebar from "./Sidebar";
import PersonaBar from "./PersonaBar";
import Chatbot from "./Chatbot";

/**
 * The login → dashboard entrance animation plays once per session, on the
 * first dashboard painted after login — not on every client-side navigation.
 */
let entranceUsed = false;

export default function DashboardShell({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  const { persona } = useAuth();
  const { vehicles: allVehicles } = useVehicleStore();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [entrance] = useState(() => !entranceUsed);

  useEffect(() => {
    entranceUsed = true;
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileNavOpen]);

  // Title and favicon name the persona, so a stray tab in a screen-share still reads right.
  useEffect(() => {
    if (!persona) return;
    document.title = `DhanFlow — ${persona.label} view`;
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (link) link.href = faviconDataUri(persona.role);
  }, [persona]);

  if (!persona) return null;

  const vehicles = filterVehiclesForRole(allVehicles, persona.role);
  const isRoleHome = pathname === `/${persona.role}`;

  return (
    <div data-role={persona.role} className="flex min-h-screen flex-col">
      <PersonaBar
        onMenuClick={() => setMobileNavOpen(true)}
        onOpenChat={() => setChatOpen(true)}
        chatOpen={chatOpen}
      />

      <div className="flex min-h-0 flex-1">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 bg-navy/50"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 shadow-lg">
              <Sidebar expanded onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 bg-canvas px-4 py-6 sm:px-6">
          <div
            className={`mx-auto flex w-full max-w-[1440px] flex-col gap-6 ${
              entrance ? "animate-rise" : ""
            }`}
          >
            <div>
              {isRoleHome && (
                <p className="text-sm text-ink-muted">
                  {getGreetingWord()}, {persona.name.split(" ")[0]} — {persona.org},{" "}
                  {persona.location}
                </p>
              )}
              <h1 className="font-display mt-1 text-2xl leading-tight tracking-tight text-ink sm:text-3xl">
                {isRoleHome ? getPersonaHeadline(vehicles, persona.role) : title}
              </h1>
              {(isRoleHome || caption) && (
                <p className="mt-1.5 text-sm text-ink-muted">
                  {isRoleHome ? `${title} · ${persona.question}` : caption}
                </p>
              )}
            </div>

            {children}
          </div>
        </main>
      </div>

      <Chatbot open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
