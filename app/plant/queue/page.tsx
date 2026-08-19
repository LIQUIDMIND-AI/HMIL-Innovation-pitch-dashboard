"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import PipelineBoard from "@/components/PipelineBoard";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function PlantQueue() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "plant");

  return (
    <DashboardShell title="Gate-out queue">
      <PipelineBoard vehicles={vehicles} />
    </DashboardShell>
  );
}

export default function PlantQueuePage() {
  return (
    <RoleGate role="plant">
      <PlantQueue />
    </RoleGate>
  );
}
