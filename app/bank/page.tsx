"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function BankDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "bank");

  return (
    <DashboardShell title="Funding Requests">
      <KpiStrip items={getKpisFromVehicles(vehicles, "bank")} />
    </DashboardShell>
  );
}

export default function BankPage() {
  return (
    <RoleGate role="bank">
      <BankDashboard />
    </RoleGate>
  );
}
