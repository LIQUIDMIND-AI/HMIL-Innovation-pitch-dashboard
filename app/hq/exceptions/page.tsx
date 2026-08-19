"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function HqExceptions() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "hq");

  return (
    <DashboardShell title="Exception queue">
      <ExceptionList vehicles={vehicles} />
    </DashboardShell>
  );
}

export default function HqExceptionsPage() {
  return (
    <RoleGate role="hq">
      <HqExceptions />
    </RoleGate>
  );
}
