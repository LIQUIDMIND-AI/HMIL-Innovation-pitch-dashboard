"use client";

import Link from "next/link";
import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import HqCharts from "@/components/HqCharts";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function HqDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "hq");

  return (
    <DashboardShell title="National overview">
      <KpiStrip items={getKpisFromVehicles(vehicles, "hq")} />

      <section aria-labelledby="exceptions-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="exceptions-heading" className="text-sm font-semibold text-ink">
            Needs attention
          </h2>
          <Link href="/hq/exceptions" className="text-xs font-medium text-role hover:underline">
            Open the exception queue →
          </Link>
        </div>
        <ExceptionList vehicles={vehicles} />
      </section>

      <section aria-labelledby="analytics-heading">
        <h2 id="analytics-heading" className="mb-2 text-sm font-semibold text-ink">
          Analytics
        </h2>
        <HqCharts vehicles={vehicles} />
      </section>
    </DashboardShell>
  );
}

export default function HqPage() {
  return (
    <RoleGate role="hq">
      <HqDashboard />
    </RoleGate>
  );
}
