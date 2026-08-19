"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RootPage() {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    router.replace(role ? `/${role}` : "/login");
  }, [role, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">
      Loading…
    </div>
  );
}
