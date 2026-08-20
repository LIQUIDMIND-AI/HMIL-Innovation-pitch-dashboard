import type { Vehicle } from "@/lib/types";
import { formatDateTime, formatINR } from "@/lib/format";
import StatusChip from "./StatusChip";

function Row({
  label,
  mono = false,
  children,
}: {
  label: string;
  /** Identifiers, amounts and timestamps render in the data face. */
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-xs text-ink-muted">{label}</dt>
      <dd className={`text-right text-sm text-ink ${mono ? "font-mono-vin" : ""}`}>{children}</dd>
    </div>
  );
}

/**
 * Renders a chassis string against its counterpart with every differing digit
 * boxed in red. Both sides render in IBM Plex Mono at the same size, so the
 * 4921 / 4912 transposition lines up character-for-character — this is the one
 * detail that sells the whole product, so it is pixel-matched on purpose.
 */
function ChassisValue({
  value,
  other,
  highlight,
}: {
  value: string;
  other?: string;
  highlight: boolean;
}) {
  if (!highlight || !other) {
    return (
      <span className="font-mono-vin text-lg font-semibold tracking-[0.08em] text-ink">
        {value}
      </span>
    );
  }
  return (
    <span className="font-mono-vin text-lg font-semibold tracking-[0.08em]">
      {value.split("").map((ch, i) => {
        const differs = other[i] !== ch;
        return (
          <span
            key={i}
            className={
              differs
                ? "rounded-[4px] bg-stuck/10 text-stuck ring-1 ring-stuck/40"
                : "text-ink"
            }
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}

export default function DocCompare({ vehicle }: { vehicle: Vehicle }) {
  const chassisMismatch = vehicle.checks.chassisMatch === "MISMATCH";
  const hasConfirmation = vehicle.bank.status !== "PENDING";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Invoice
        </h3>
        <dl className="mt-3 flex flex-col gap-2.5">
          <Row label="Invoice No." mono>{vehicle.invoice.number}</Row>
          <Row label="Date" mono>{vehicle.invoice.date}</Row>
          <Row label="Model">
            {vehicle.model} {vehicle.variant} · {vehicle.colour}
          </Row>
          <Row label="Chassis">
            <ChassisValue
              value={vehicle.chassisShort}
              other={vehicle.bank.chassisOnConfirmation}
              highlight={chassisMismatch}
            />
          </Row>
          <Row label="Amount" mono>{formatINR(vehicle.invoice.amount)}</Row>
          <Row label="GST" mono>{formatINR(vehicle.invoice.gst)}</Row>
          <Row label="IRN">
            <span className="font-mono-vin text-xs text-ink-muted">{vehicle.invoice.irn}</span>
          </Row>
        </dl>
      </div>

      <div
        className={`rounded-xl border p-5 shadow-card ${
          chassisMismatch ? "border-stuck/40 bg-stuck-bg/40" : "border-border bg-surface"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Funding Confirmation
          </h3>
          <StatusChip
            tone={
              vehicle.bank.status === "RECEIVED"
                ? "clear"
                : vehicle.bank.status === "MISMATCH"
                  ? "stuck"
                  : "pending"
            }
          >
            {vehicle.bank.status}
          </StatusChip>
        </div>

        {hasConfirmation ? (
          <dl className="mt-3 flex flex-col gap-2.5">
            <Row label="Bank">{vehicle.bank.name}</Row>
            <Row label="Chassis on Confirmation">
              {vehicle.bank.chassisOnConfirmation ? (
                <ChassisValue
                  value={vehicle.bank.chassisOnConfirmation}
                  other={vehicle.chassisShort}
                  highlight={chassisMismatch}
                />
              ) : (
                "—"
              )}
            </Row>
            <Row label="Amount" mono>
              {vehicle.bank.amount !== undefined ? formatINR(vehicle.bank.amount) : "—"}
            </Row>
            <Row label="Received" mono>
              {vehicle.bank.receivedAt ? formatDateTime(vehicle.bank.receivedAt) : "—"}
            </Row>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">
            Awaiting funding confirmation from {vehicle.bank.name}.
          </p>
        )}
      </div>
    </div>
  );
}
