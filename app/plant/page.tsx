"use client";

import Link from "next/link";
import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function PlantDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "plant");

  return (
    <DashboardShell title="Dispatch desk">
      <KpiStrip items={getKpisFromVehicles(vehicles, "plant")} />

      <section aria-labelledby="blocked-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="blocked-heading" className="text-sm font-semibold text-ink">
            Blocked at the gate
          </h2>
          <Link href="/plant/queue" className="text-xs font-medium text-role hover:underline">
            Open the gate-out queue →
          </Link>
        </div>
        <ExceptionList vehicles={vehicles} />
      </section>
    </DashboardShell>
  );
}

export default function PlantPage() {
  return (
    <RoleGate role="plant">
      <PlantDashboard />
    </RoleGate>
  );
}
