"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useHydrated } from "@/lib/auth";

export default function RootPage() {
  const { role } = useAuth();
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(role ? `/${role}` : "/login");
  }, [hydrated, role, router]);

  return null;
}
