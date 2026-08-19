"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import PipelineBoard from "@/components/PipelineBoard";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function LspDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "lsp");

  return (
    <DashboardShell title="Trip Board">
      <div className="flex flex-col gap-6">
        <KpiStrip items={getKpisFromVehicles(vehicles, "lsp")} />

        <section aria-labelledby="pipeline-heading">
          <h2 id="pipeline-heading" className="mb-2 text-sm font-semibold text-ink">
            Assigned trips
          </h2>
          <PipelineBoard vehicles={vehicles} />
        </section>

        <section aria-labelledby="exceptions-heading">
          <h2 id="exceptions-heading" className="mb-2 text-sm font-semibold text-ink">
            Exceptions
          </h2>
          <ExceptionList vehicles={vehicles} />
        </section>
      </div>
    </DashboardShell>
  );
}

export default function LspPage() {
  return (
    <RoleGate role="lsp">
      <LspDashboard />
    </RoleGate>
  );
}
