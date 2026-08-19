"use client";

import { useAuth } from "@/lib/auth";

export default function TopBar({ title }: { title: string }) {
  const { persona } = useAuth();
  if (!persona) return null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold text-ink">{title}</h1>
        <p className="truncate text-xs text-ink-muted">{persona.org}</p>
      </div>
      <span className="ml-4 shrink-0 whitespace-nowrap rounded-full border border-pending/30 bg-pending-bg px-2.5 py-1 text-[11px] font-medium text-pending">
        DEMO — dummy data
      </span>
    </header>
  );
}
