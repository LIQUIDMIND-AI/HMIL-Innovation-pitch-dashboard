"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getRegionalDealerRollup } from "@/lib/selectors";

function RoDealerRollup() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "ro");
  const dealerRollup = getRegionalDealerRollup(vehicles);

  return (
    <DashboardShell title="Dealer-wise rollup">
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-ink-muted">
              <th scope="col" className="px-4 py-2 font-medium">
                Dealer
              </th>
              <th scope="col" className="px-4 py-2 font-medium tabular-nums">
                Total
              </th>
              <th scope="col" className="px-4 py-2 font-medium tabular-nums">
                Stuck
              </th>
            </tr>
          </thead>
          <tbody>
            {dealerRollup.map((row) => (
              <tr key={row.dealerCode} className="border-b border-border last:border-0">
                <td className="px-4 py-2 text-ink">{row.dealerName}</td>
                <td className="px-4 py-2 tabular-nums text-ink">{row.total}</td>
                <td
                  className={`px-4 py-2 tabular-nums ${
                    row.stuck > 0 ? "font-medium text-stuck" : "text-ink-muted"
                  }`}
                >
                  {row.stuck}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}

export default function RoDealersPage() {
  return (
    <RoleGate role="ro">
      <RoDealerRollup />
    </RoleGate>
  );
}
