"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import ComplianceAlerts from "@/components/ComplianceAlerts";
import ComplianceReportView from "@/components/ComplianceReportView";
import { useVehicleStore } from "@/lib/store";
import { getAlertsForRole, getComplianceReportForRole } from "@/lib/selectors";

function HqCompliance() {
  const { vehicles, documents } = useVehicleStore();
  const findings = getAlertsForRole(vehicles, documents, "hq");
  const report = getComplianceReportForRole(vehicles, documents, "hq");

  return (
    <DashboardShell
      title="Document compliance"
      caption="Every document raised by every party, cross-checked against the others — mismatches surface here, not at the gate."
    >
      <section aria-labelledby="alerts">
        <h2 id="alerts" className="mb-2 text-sm font-semibold text-ink">
          Open alerts
        </h2>
        <ComplianceAlerts findings={findings} />
      </section>

      <ComplianceReportView report={report} />
    </DashboardShell>
  );
}

export default function HqCompliancePage() {
  return (
    <RoleGate role="hq">
      <HqCompliance />
    </RoleGate>
  );
}
