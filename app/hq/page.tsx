"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import PipelineBoard from "@/components/PipelineBoard";
import ExceptionList from "@/components/ExceptionList";
import HqCharts from "@/components/HqCharts";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function HqDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "hq");

  return (
    <DashboardShell title="HQ Overview">
      <div className="flex flex-col gap-6">
        <KpiStrip items={getKpisFromVehicles(vehicles, "hq")} />

        <section aria-labelledby="analytics-heading">
          <h2 id="analytics-heading" className="mb-2 text-sm font-semibold text-ink">
            Analytics
          </h2>
          <HqCharts vehicles={vehicles} />
        </section>

        <section aria-labelledby="pipeline-heading">
          <h2 id="pipeline-heading" className="mb-2 text-sm font-semibold text-ink">
            Pipeline — all regions
          </h2>
          <PipelineBoard vehicles={vehicles} />
        </section>

        <section aria-labelledby="exceptions-heading">
          <h2 id="exceptions-heading" className="mb-2 text-sm font-semibold text-ink">
            Exception queue
          </h2>
          <ExceptionList vehicles={vehicles} />
        </section>
      </div>
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
