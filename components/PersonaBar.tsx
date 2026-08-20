"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Menu, Repeat } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PersonaIcon from "./PersonaIcon";

/**
 * Pinned to the top of every screen. A screenshot of any page must answer
 * "whose view is this?" on its own — hence avatar, name, title, entity and the
 * role-hue ribbon along the bottom edge (build plan v3 §1.1).
 */
export default function PersonaBar({
  onMenuClick,
  onOpenChat,
  chatOpen,
}: {
  onMenuClick?: () => void;
  onOpenChat?: () => void;
  chatOpen?: boolean;
}) {
  const { persona, logout } = useAuth();
  const router = useRouter();
  if (!persona) return null;

  function handleSwitchPersona() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-30 shrink-0 bg-navy text-white">
      <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <Link
          href={`/${persona.role}`}
          className="hidden shrink-0 items-center gap-2 rounded-lg py-2 pr-2 sm:flex"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">
            D
          </span>
          <span className="font-display text-lg leading-none tracking-tight">DhanFlow</span>
        </Link>

        <span className="hidden h-8 w-px shrink-0 bg-white/15 sm:block" aria-hidden="true" />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-white/20 bg-role"
            aria-hidden="true"
          >
            {persona.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              {persona.name}
              <span className="sr-only">, signed in as {persona.label}</span>
            </p>
            <p className="truncate text-xs leading-tight text-white/65">
              <span className="hidden sm:inline">{persona.title} · </span>
              {persona.org}, {persona.location}
            </p>
          </div>
        </div>

        <span className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white bg-role md:inline-flex">
          <PersonaIcon role={persona.role} className="h-3.5 w-3.5" />
          {persona.label}
        </span>

        {onOpenChat && (
          <button
            type="button"
            onClick={onOpenChat}
            aria-label="Ask DhanFlow"
            aria-expanded={chatOpen}
            className={`animate-launcher-pulse flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10 ${
              chatOpen ? "bg-white/15" : ""
            }`}
          >
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </button>
        )}

        <button
          type="button"
          onClick={handleSwitchPersona}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-white/20 px-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
        >
          <Repeat className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden lg:inline">Switch persona</span>
        </button>
      </div>
      {/* The role ribbon — the quiet answer to "whose view is this?" */}
      <div className="h-1 w-full bg-role" aria-hidden="true" />
    </header>
  );
}
