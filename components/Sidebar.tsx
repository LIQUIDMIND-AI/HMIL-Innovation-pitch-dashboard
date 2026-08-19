"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import PersonaIcon from "./PersonaIcon";

export default function Sidebar() {
  const { persona, logout } = useAuth();
  const router = useRouter();

  if (!persona) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-sm font-semibold text-white">
          D
        </span>
        <span className="text-sm font-semibold tracking-tight text-ink">DhanFlow</span>
      </div>

      <div className="border-b border-border px-3 py-4">
        <div className="flex items-center gap-2 rounded-md bg-navy-light px-2.5 py-2">
          <PersonaIcon role={persona.role} className="h-4 w-4 shrink-0 text-navy" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-navy">{persona.label}</p>
            <p className="truncate text-[11px] text-ink-muted">{persona.org}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3" aria-label="Primary">
        <Link
          href={`/${persona.role}`}
          className="flex items-center gap-2 rounded-md bg-navy-light px-3 py-2 text-sm font-medium text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>
      </nav>

      <div className="border-t border-border px-2 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-stuck-bg hover:text-stuck focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}
