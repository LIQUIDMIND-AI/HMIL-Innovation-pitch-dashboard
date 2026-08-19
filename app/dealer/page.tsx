"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import PipelineBoard from "@/components/PipelineBoard";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function DealerDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "dealer");

  return (
    <DashboardShell title="My Vehicles">
      <div className="flex flex-col gap-6">
        <KpiStrip items={getKpisFromVehicles(vehicles, "dealer")} />

        <section aria-labelledby="pipeline-heading">
          <h2 id="pipeline-heading" className="mb-2 text-sm font-semibold text-ink">
            Order pipeline
          </h2>
          <PipelineBoard vehicles={vehicles} showDealer={false} />
        </section>

        <section aria-labelledby="exceptions-heading">
          <h2 id="exceptions-heading" className="mb-2 text-sm font-semibold text-ink">
            Needs attention
          </h2>
          <ExceptionList vehicles={vehicles} />
        </section>
      </div>
    </DashboardShell>
  );
}

export default function DealerPage() {
  return (
    <RoleGate role="dealer">
      <DealerDashboard />
    </RoleGate>
  );
}
