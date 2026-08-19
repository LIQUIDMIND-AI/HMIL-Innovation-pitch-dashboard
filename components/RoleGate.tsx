"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

/**
 * Route guard: renders children only when the logged-in role matches `role`.
 * A mismatched or missing session redirects away — to the session's own home
 * if one exists, otherwise to /login. This is what blocks URL-hopping across
 * roles (e.g. a dealer typing /hq into the address bar).
 */
export default function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { role: sessionRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!sessionRole) {
      router.replace("/login");
      return;
    }
    if (sessionRole !== role) {
      router.replace(`/${sessionRole}`);
    }
  }, [sessionRole, role, router]);

  if (sessionRole !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
