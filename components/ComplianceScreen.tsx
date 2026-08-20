"use client";

import DashboardShell from "@/components/DashboardShell";
import ComplianceAlerts from "@/components/ComplianceAlerts";
import ComplianceReportView from "@/components/ComplianceReportView";
import SlaReportView from "@/components/SlaReportView";
import { useVehicleStore } from "@/lib/store";
import {
  getAlertsForRole,
  getComplianceReportForRole,
  getSlaReportForRole,
} from "@/lib/selectors";
import type { Role } from "@/lib/types";

/** Shared compliance + SLA screen — the same rulebook read through each role's scope. */
export default function ComplianceScreen({ role }: { role: Role }) {
  const { vehicles, documents } = useVehicleStore();
  const findings = getAlertsForRole(vehicles, documents, role);
  const report = getComplianceReportForRole(vehicles, documents, role);
  const sla = getSlaReportForRole(vehicles, role);

  return (
    <DashboardShell
      title="Compliance & SLA"
      caption="Every document cross-checked against the others, and every promised turnaround measured against the clock."
    >
      <section aria-labelledby="alerts">
        <h2 id="alerts" className="mb-2 text-sm font-semibold text-ink">
          Open document alerts
        </h2>
        <ComplianceAlerts findings={findings} />
      </section>

      <ComplianceReportView report={report} />

      <section aria-labelledby="sla">
        <h2 id="sla" className="mb-2 text-sm font-semibold text-ink">
          Service levels
        </h2>
        <SlaReportView report={sla} />
      </section>
    </DashboardShell>
  );
}
