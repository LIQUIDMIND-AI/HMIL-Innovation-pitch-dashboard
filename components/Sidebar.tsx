"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Repeat } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { NAV_ITEMS } from "@/lib/nav";
import PersonaIcon from "./PersonaIcon";

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { persona, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!persona) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
    onNavigate?.();
  }

  function handleSwitchPersona() {
    logout();
    router.replace("/login");
    onNavigate?.();
  }

  const navItems = NAV_ITEMS[persona.role];

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-surface sm:w-64">
      <Link
        href={`/${persona.role}`}
        onClick={onNavigate}
        className="flex min-h-11 items-center gap-2 border-b border-border px-4 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy text-sm font-semibold text-white">
          D
        </span>
        <span className="text-sm font-semibold tracking-tight text-ink">DhanFlow</span>
      </Link>

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
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy ${
                    isActive
                      ? "bg-navy-light text-navy"
                      : "text-ink-muted hover:bg-navy-light/60 hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-2 py-3">
        <button
          type="button"
          onClick={handleSwitchPersona}
          className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-navy-light hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <Repeat className="h-4 w-4" aria-hidden="true" />
          Switch Persona
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-stuck-bg hover:text-stuck focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </aside>
  );
}
