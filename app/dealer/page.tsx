import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import PipelineBoard from "@/components/PipelineBoard";
import ExceptionList from "@/components/ExceptionList";
import { getKpisForRole, getVehiclesForRole } from "@/lib/selectors";

export default function DealerPage() {
  const vehicles = getVehiclesForRole("dealer");

  return (
    <RoleGate role="dealer">
      <DashboardShell title="My Vehicles">
        <div className="flex flex-col gap-6">
          <KpiStrip items={getKpisForRole("dealer")} />

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
    </RoleGate>
  );
}
