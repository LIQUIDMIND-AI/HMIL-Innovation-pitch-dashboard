"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function RoExceptions() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "ro");

  return (
    <DashboardShell title="Stuck cars — reasons">
      <ExceptionList vehicles={vehicles} />
    </DashboardShell>
  );
}

export default function RoExceptionsPage() {
  return (
    <RoleGate role="ro">
      <RoExceptions />
    </RoleGate>
  );
}
