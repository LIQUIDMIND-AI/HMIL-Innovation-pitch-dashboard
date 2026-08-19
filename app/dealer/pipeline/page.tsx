"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import PipelineBoard from "@/components/PipelineBoard";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";

function DealerPipeline() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "dealer");

  return (
    <DashboardShell title="Order pipeline">
      <PipelineBoard vehicles={vehicles} showDealer={false} />
    </DashboardShell>
  );
}

export default function DealerPipelinePage() {
  return (
    <RoleGate role="dealer">
      <DealerPipeline />
    </RoleGate>
  );
}
