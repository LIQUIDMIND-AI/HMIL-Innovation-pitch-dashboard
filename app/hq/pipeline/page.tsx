"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import PipelineBoard from "@/components/PipelineBoard";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function HqPipeline() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "hq");

  return (
    <DashboardShell title="Pipeline — all regions">
      <PipelineBoard vehicles={vehicles} />
    </DashboardShell>
  );
}

export default function HqPipelinePage() {
  return (
    <RoleGate role="hq">
      <HqPipeline />
    </RoleGate>
  );
}
