"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import ExceptionList from "@/components/ExceptionList";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function LspExceptions() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "lsp");

  return (
    <DashboardShell title="Exceptions">
      <ExceptionList vehicles={vehicles} />
    </DashboardShell>
  );
}

export default function LspExceptionsPage() {
  return (
    <RoleGate role="lsp">
      <LspExceptions />
    </RoleGate>
  );
}
