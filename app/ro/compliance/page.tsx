"use client";

import RoleGate from "@/components/RoleGate";
import ComplianceScreen from "@/components/ComplianceScreen";

export default function RoCompliancePage() {
  return (
    <RoleGate role="ro">
      <ComplianceScreen role="ro" />
    </RoleGate>
  );
}
