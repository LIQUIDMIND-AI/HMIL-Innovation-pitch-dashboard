"use client";

import { useState } from "react";
import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import DocumentList from "@/components/DocumentList";
import StatusChip from "@/components/StatusChip";
import { useVehicleStore } from "@/lib/store";
import { filterVehiclesForRole, getAlertsForRole, getDocumentsForRole } from "@/lib/selectors";
import { formatINR } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

const INPUT =
  "min-h-11 rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-role font-mono-vin";

/** The desk where the bank raises its one document — and everyone else reads it. */
function IssueRow({ vehicle }: { vehicle: Vehicle }) {
  const { issueFundingConfirmation } = useVehicleStore();
  const [chassis, setChassis] = useState(vehicle.chassisShort);
  const [amount, setAmount] = useState(String(vehicle.invoice.amount));
  const [issued, setIssued] = useState(false);

  return (
    <li className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">
            {vehicle.model} {vehicle.variant}
          </p>
          <p className="font-mono-vin mt-0.5 text-xs text-ink-muted">
            •••{vehicle.chassisShort} · {vehicle.invoice.number} ·{" "}
            {formatINR(vehicle.invoice.amount)}
          </p>
        </div>
        <StatusChip tone="pending">Awaiting confirmation</StatusChip>
      </div>

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          issueFundingConfirmation(vehicle.vin, { chassis: chassis.trim(), amount: Number(amount) });
          setIssued(true);
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`chassis-${vehicle.vin}`} className="text-xs font-medium text-ink-muted">
            Chassis on confirmation
          </label>
          <input
            id={`chassis-${vehicle.vin}`}
            value={chassis}
            onChange={(e) => setChassis(e.target.value)}
            className={`${INPUT} w-32`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`amount-${vehicle.vin}`} className="text-xs font-medium text-ink-muted">
            Amount released
          </label>
          <input
            id={`amount-${vehicle.vin}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            className={`${INPUT} w-40`}
          />
        </div>
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-role px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Issue confirmation
        </button>
        {issued && (
          <p role="status" className="text-xs text-ink-muted">
            Shared with the manufacturer, the plant, the RO and the dealer.
          </p>
        )}
      </form>

      <p className="mt-2 text-[11px] text-ink-muted">
        Type a different chassis or a short amount to watch the compliance rules catch it on the
        other side.
      </p>
    </li>
  );
}

function BankDocuments() {
  const { vehicles, documents } = useVehicleStore();
  const scoped = filterVehiclesForRole(vehicles, "bank");
  const pending = scoped.filter((v) => v.bank.status === "PENDING");
  const docs = getDocumentsForRole(documents, vehicles, "bank");
  const findings = getAlertsForRole(vehicles, documents, "bank");

  return (
    <DashboardShell
      title="Documents issued"
      caption="One funding confirmation, raised once and read by everyone waiting on it."
    >
      <section aria-labelledby="pending-heading">
        <h2 id="pending-heading" className="mb-2 text-sm font-semibold text-ink">
          Awaiting your confirmation
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-ink-muted">
            Nothing is waiting on this desk right now.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((v) => (
              <IssueRow key={v.vin} vehicle={v} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="issued-heading">
        <h2 id="issued-heading" className="mb-2 text-sm font-semibold text-ink">
          On the shared record
        </h2>
        <DocumentList
          docs={docs.filter((d) => d.issuedBy === "bank")}
          findings={findings}
        />
      </section>
    </DashboardShell>
  );
}

export default function BankDocumentsPage() {
  return (
    <RoleGate role="bank">
      <BankDocuments />
    </RoleGate>
  );
}
