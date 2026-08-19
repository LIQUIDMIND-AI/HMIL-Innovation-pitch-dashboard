"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import PipelineBoard from "@/components/PipelineBoard";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function PlantDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "plant");

  return (
    <DashboardShell title="Plant Dispatch Desk">
      <div className="flex flex-col gap-6">
        <KpiStrip items={getKpisFromVehicles(vehicles, "plant")} />

        <section aria-labelledby="pipeline-heading">
          <h2 id="pipeline-heading" className="mb-2 text-sm font-semibold text-ink">
            Gate-out queue
          </h2>
          <PipelineBoard vehicles={vehicles} />
        </section>

        <section aria-labelledby="exceptions-heading">
          <h2 id="exceptions-heading" className="mb-2 text-sm font-semibold text-ink">
            Blocked — mismatch reasons
          </h2>
          <ExceptionList vehicles={vehicles} />
        </section>
      </div>
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
