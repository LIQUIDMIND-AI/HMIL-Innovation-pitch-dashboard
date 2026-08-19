import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import PipelineBoard from "@/components/PipelineBoard";
import ExceptionList from "@/components/ExceptionList";
import { getKpisForRole, getVehiclesForRole } from "@/lib/selectors";

export default function HqPage() {
  const vehicles = getVehiclesForRole("hq");

  return (
    <RoleGate role="hq">
      <DashboardShell title="HQ Overview">
        <div className="flex flex-col gap-6">
          <KpiStrip items={getKpisForRole("hq")} />

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
    </RoleGate>
  );
}
