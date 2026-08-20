"use client";

import RoleGate from "@/components/RoleGate";
import ComplianceScreen from "@/components/ComplianceScreen";

export default function HqCompliancePage() {
  return (
    <RoleGate role="hq">
      <ComplianceScreen role="hq" />
    </RoleGate>
  );
}
