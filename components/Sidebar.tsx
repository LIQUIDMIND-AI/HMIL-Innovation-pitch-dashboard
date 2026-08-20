"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { NAV_ITEMS } from "@/lib/nav";

/**
 * 240px rail at ≥1280, icon-only rail between 768 and 1279, and rendered
 * expanded inside the mobile drawer (`expanded`).
 */
export default function Sidebar({
  onNavigate,
  expanded = false,
}: {
  onNavigate?: () => void;
  expanded?: boolean;
}) {
  const { persona, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!persona) return null;

  function handleLogout() {
    logout();
    router.replace("/login");
    onNavigate?.();
  }

  const navItems = NAV_ITEMS[persona.role];
  const width = expanded ? "w-64" : "w-16 xl:w-60";
  const labelClass = expanded ? "" : "hidden xl:inline";
  const rowClass = expanded ? "" : "justify-center xl:justify-start";

  return (
    <aside
      className={`flex h-full ${width} shrink-0 flex-col border-r border-border bg-surface`}
    >
      <nav className="flex-1 px-2 py-4" aria-label="Primary">
        <p
          className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-muted ${labelClass}`}
        >
          {persona.label}
        </p>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${persona.role}` && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  title={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${rowClass} ${
                    isActive
                      ? "bg-role-tint text-role"
                      : "text-ink-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span className={`truncate ${labelClass}`}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border px-2 py-3">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-stuck-bg hover:text-stuck ${rowClass}`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          <span className={labelClass}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
