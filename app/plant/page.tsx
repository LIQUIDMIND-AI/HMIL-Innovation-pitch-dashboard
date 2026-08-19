import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import PipelineBoard from "@/components/PipelineBoard";
import ExceptionList from "@/components/ExceptionList";
import { getKpisForRole, getVehiclesForRole } from "@/lib/selectors";

export default function PlantPage() {
  const vehicles = getVehiclesForRole("plant");

  return (
    <RoleGate role="plant">
      <DashboardShell title="Plant Dispatch Desk">
        <div className="flex flex-col gap-6">
          <KpiStrip items={getKpisForRole("plant")} />

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
    </RoleGate>
  );
}
