import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import KpiStrip from "@/components/KpiStrip";
import StatusChip from "@/components/StatusChip";
import { getKpisForRole, getVehiclesForRole } from "@/lib/selectors";
import { formatINR } from "@/lib/format";
import type { ChipTone } from "@/lib/types";

const STATUS_TONE: Record<"PENDING" | "RECEIVED" | "MISMATCH", ChipTone> = {
  PENDING: "pending",
  RECEIVED: "clear",
  MISMATCH: "stuck",
};

export default function BankPage() {
  const vehicles = getVehiclesForRole("bank");

  return (
    <RoleGate role="bank">
      <DashboardShell title="Funding Requests">
        <div className="flex flex-col gap-6">
          <KpiStrip items={getKpisForRole("bank")} />

          <section aria-labelledby="funding-heading">
            <h2 id="funding-heading" className="mb-2 text-sm font-semibold text-ink">
              Funding requests referencing your dealer accounts
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-ink-muted">
                    <th scope="col" className="px-4 py-2 font-medium">
                      Chassis No.
                    </th>
                    <th scope="col" className="px-4 py-2 font-medium">
                      Dealer
                    </th>
                    <th scope="col" className="px-4 py-2 font-medium tabular-nums">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-2 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.vin} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 font-mono-vin text-ink">{v.chassisShort}</td>
                      <td className="px-4 py-2 text-ink">{v.dealerName}</td>
                      <td className="px-4 py-2 tabular-nums text-ink">
                        {formatINR(v.bank.amount ?? v.invoice.amount)}
                      </td>
                      <td className="px-4 py-2">
                        <StatusChip tone={STATUS_TONE[v.bank.status]}>{v.bank.status}</StatusChip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              DhanFlow reads your funding status as a signal — it is not a connected party
              and never exchanges documents with the bank.
            </p>
          </section>
        </div>
      </DashboardShell>
    </RoleGate>
  );
}
