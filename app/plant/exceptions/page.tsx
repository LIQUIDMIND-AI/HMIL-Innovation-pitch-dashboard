"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function PlantExceptions() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "plant");

  return (
    <DashboardShell title="Blocked — mismatch reasons">
      <ExceptionList vehicles={vehicles} />
    </DashboardShell>
  );
}

export default function PlantExceptionsPage() {
  return (
    <RoleGate role="plant">
      <PlantExceptions />
    </RoleGate>
  );
}
