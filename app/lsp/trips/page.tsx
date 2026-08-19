"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import PipelineBoard from "@/components/PipelineBoard";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function LspTrips() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "lsp");

  return (
    <DashboardShell title="Assigned trips">
      <PipelineBoard vehicles={vehicles} showLsp />
    </DashboardShell>
  );
}

export default function LspTripsPage() {
  return (
    <RoleGate role="lsp">
      <LspTrips />
    </RoleGate>
  );
}
