"use client";

import RoleGate from "@/components/RoleGate";
import ComplianceScreen from "@/components/ComplianceScreen";

export default function PlantCompliancePage() {
  return (
    <RoleGate role="plant">
      <ComplianceScreen role="plant" />
    </RoleGate>
  );
}
