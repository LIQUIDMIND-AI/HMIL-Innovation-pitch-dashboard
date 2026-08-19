"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import PipelineBoard from "@/components/PipelineBoard";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function RoPipeline() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "ro");

  return (
    <DashboardShell title="Regional pipeline">
      <PipelineBoard vehicles={vehicles} />
    </DashboardShell>
  );
}

export default function RoPipelinePage() {
  return (
    <RoleGate role="ro">
      <RoPipeline />
    </RoleGate>
  );
}
