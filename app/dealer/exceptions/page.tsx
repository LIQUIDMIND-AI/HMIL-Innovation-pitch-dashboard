"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function DealerExceptions() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "dealer");

  return (
    <DashboardShell title="Needs attention">
      <ExceptionList vehicles={vehicles} />
    </DashboardShell>
  );
}

export default function DealerExceptionsPage() {
  return (
    <RoleGate role="dealer">
      <DealerExceptions />
    </RoleGate>
  );
}
