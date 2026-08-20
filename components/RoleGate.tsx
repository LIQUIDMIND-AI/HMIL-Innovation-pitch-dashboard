"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useHydrated } from "@/lib/auth";
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
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    // Wait for the real client value: the server snapshot is always null.
    if (!hydrated) return;
    if (!sessionRole) {
      router.replace("/login");
      return;
    }
    if (sessionRole !== role) {
      router.replace(`/${sessionRole}`);
    }
  }, [hydrated, sessionRole, role, router]);

  // Nothing is rendered while the redirect resolves — data is local, so there
  // is never a loading state to show, and a flash of placeholder text would
  // read as one.
  if (sessionRole !== role) return null;

  return <>{children}</>;
}
