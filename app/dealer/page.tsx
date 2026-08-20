"use client";

import Link from "next/link";
import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import ExceptionList from "@/components/ExceptionList";
import ComplianceAlerts from "@/components/ComplianceAlerts";
import PipelineBoard from "@/components/PipelineBoard";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getAlertsForRole, getKpisFromVehicles } from "@/lib/selectors";

function DealerDashboard() {
  const { vehicles: allVehicles, documents } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "dealer");
  const findings = getAlertsForRole(allVehicles, documents, "dealer");

  return (
    <DashboardShell title="My vehicles">
      <KpiStrip items={getKpisFromVehicles(vehicles, "dealer")} />

      <section aria-labelledby="risk-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="risk-heading" className="text-sm font-semibold text-ink">
            At risk
          </h2>
          <Link
            href="/dealer/exceptions"
            className="text-xs font-medium text-role hover:underline"
          >
            See what each one needs →
          </Link>
        </div>
        <ExceptionList vehicles={vehicles} />
      </section>

      <section aria-labelledby="doc-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="doc-heading" className="text-sm font-semibold text-ink">
            Document alerts
          </h2>
          <Link href="/dealer/compliance" className="text-xs font-medium text-role hover:underline">
            Open the compliance report →
          </Link>
        </div>
        <ComplianceAlerts findings={findings} limit={3} />
      </section>

      <section aria-labelledby="pipeline-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="pipeline-heading" className="text-sm font-semibold text-ink">
            Your order pipeline
          </h2>
          <Link href="/dealer/tracking" className="text-xs font-medium text-role hover:underline">
            Track cars on the road →
          </Link>
        </div>
        <PipelineBoard vehicles={vehicles} showDealer={false} />
      </section>
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
