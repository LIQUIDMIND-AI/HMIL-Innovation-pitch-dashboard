"use client";

import Link from "next/link";
import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import PipelineBoard from "@/components/PipelineBoard";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getKpisFromVehicles } from "@/lib/selectors";

function LspDashboard() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "lsp");

  return (
    <DashboardShell title="Trip board">
      <KpiStrip items={getKpisFromVehicles(vehicles, "lsp")} />

      <section aria-labelledby="load-heading">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="load-heading" className="text-sm font-semibold text-ink">
            Cars in your care
          </h2>
          <Link href="/lsp/tracking" className="text-xs font-medium text-role hover:underline">
            Watch the trucks move →
          </Link>
        </div>
        <PipelineBoard vehicles={vehicles} showLsp />
      </section>
    </DashboardShell>
  );
}

export default function LspPage() {
  return (
    <RoleGate role="lsp">
      <LspDashboard />
    </RoleGate>
  );
}
