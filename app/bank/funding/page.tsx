"use client";

import Link from "next/link";
import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import StatusChip from "@/components/StatusChip";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole } from "@/lib/selectors";
import { formatINR } from "@/lib/format";
import type { ChipTone } from "@/lib/types";

const STATUS_TONE: Record<"PENDING" | "RECEIVED" | "MISMATCH", ChipTone> = {
  PENDING: "pending",
  RECEIVED: "clear",
  MISMATCH: "stuck",
};

function BankFunding() {
  const { vehicles: allVehicles } = useVehicleStore();
  const vehicles = filterVehiclesForRole(allVehicles, "bank");

  return (
    <DashboardShell title="Funding requests">
      <div className="flex flex-col gap-3">
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
                <tr key={v.vin} className="border-b border-border last:border-0 hover:bg-navy-light/40">
                  <td className="px-4 py-2">
                    <Link
                      href={`/vehicle/${v.vin}`}
                      className="font-mono-vin text-ink underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
                    >
                      {v.chassisShort}
                    </Link>
                  </td>
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
        <p className="text-xs text-ink-muted">
          DhanFlow reads your funding status as a signal — it is not a connected party
          and never exchanges documents with the bank.
        </p>
      </div>
    </DashboardShell>
  );
}

export default function BankFundingPage() {
  return (
    <RoleGate role="bank">
      <BankFunding />
    </RoleGate>
  );
}
