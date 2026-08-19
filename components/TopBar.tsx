"use client";

import { useRouter } from "next/navigation";
import { Menu, Repeat } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function TopBar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick?: () => void;
}) {
  const { persona, logout } = useAuth();
  const router = useRouter();
  if (!persona) return null;

  function handleSwitchPersona() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="-ml-1.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-ink transition-colors hover:bg-navy-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-ink">{title}</h1>
          <p className="truncate text-xs text-ink-muted">{persona.org}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleSwitchPersona}
        aria-label="Switch persona"
        className="flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-border bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-navy/40 hover:bg-navy-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <Repeat className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">Switch Persona</span>
      </button>
    </header>
  );
}
