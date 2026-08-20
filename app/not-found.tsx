"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/** Any unknown URL lands the presenter back somewhere real, never on a dead end. */
export default function NotFound() {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    router.replace(role ? `/${role}` : "/login");
  }, [role, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-navy px-6 text-center text-white">
      <p className="font-display text-2xl">That page doesn&apos;t exist.</p>
      <p className="text-sm text-white/60">Taking you back to your dashboard…</p>
    </main>
  );
}
