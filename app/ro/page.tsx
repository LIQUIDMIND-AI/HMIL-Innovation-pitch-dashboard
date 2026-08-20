"use client";

import Link from "next/link";
import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function RoDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "ro");

  return (
    <DashboardShell title="Chandigarh region">
      <KpiStrip items={getKpisFromVehicles(vehicles, "ro")} />

      <section aria-labelledby="region-exceptions-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="region-exceptions-heading" className="text-sm font-semibold text-ink">
            Cars losing days
          </h2>
          <Link href="/ro/dealers" className="text-xs font-medium text-role hover:underline">
            See the dealer rollup →
          </Link>
        </div>
        <ExceptionList vehicles={vehicles} />
      </section>
    </DashboardShell>
  );
}

export default function RoPage() {
  return (
    <RoleGate role="ro">
      <RoDashboard />
    </RoleGate>
  );
}
