import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import PipelineBoard from "@/components/PipelineBoard";
import ExceptionList from "@/components/ExceptionList";
import { getKpisForRole, getRegionalDealerRollup, getVehiclesForRole } from "@/lib/selectors";

export default function RoPage() {
  const vehicles = getVehiclesForRole("ro");
  const dealerRollup = getRegionalDealerRollup(vehicles);

  return (
    <RoleGate role="ro">
      <DashboardShell title="Regional Office — Chandigarh">
        <div className="flex flex-col gap-6">
          <KpiStrip items={getKpisForRole("ro")} />

          <section aria-labelledby="dealer-rollup-heading">
            <h2 id="dealer-rollup-heading" className="mb-2 text-sm font-semibold text-ink">
              Dealer-wise rollup
            </h2>
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
          </section>

          <section aria-labelledby="pipeline-heading">
            <h2 id="pipeline-heading" className="mb-2 text-sm font-semibold text-ink">
              Regional pipeline
            </h2>
            <PipelineBoard vehicles={vehicles} />
          </section>

          <section aria-labelledby="exceptions-heading">
            <h2 id="exceptions-heading" className="mb-2 text-sm font-semibold text-ink">
              Stuck cars — reasons
            </h2>
            <ExceptionList vehicles={vehicles} />
          </section>
        </div>
      </DashboardShell>
    </RoleGate>
  );
}
