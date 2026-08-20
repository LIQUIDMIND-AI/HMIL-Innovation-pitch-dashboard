"use client";

import Link from "next/link";
import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function BankDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "bank");

  return (
    <DashboardShell title="Funding desk">
      <KpiStrip items={getKpisFromVehicles(vehicles, "bank")} />

      {/* Deliberately minimal: the bank is a status source, not a platform user. */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <h2 className="text-sm font-semibold text-ink">One table, nothing more</h2>
        <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">
          DhanFlow reads the status of a funding request and shows it to everyone who is waiting
          on it. Nothing is sent to the bank, and no document ever leaves this screen.
        </p>
        <Link
          href="/bank/funding"
          className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-role hover:underline"
        >
          Open funding requests →
        </Link>
      </section>
    </DashboardShell>
  );
}

export default function BankPage() {
  return (
    <RoleGate role="bank">
      <BankDashboard />
    </RoleGate>
  );
}
