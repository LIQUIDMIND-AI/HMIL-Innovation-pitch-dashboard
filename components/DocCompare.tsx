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
              differs ? "rounded-[4px] bg-stuck/10 text-stuck ring-1 ring-stuck/40" : "text-ink"
            }
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}

/**
 * The invoice beside the dispatch papers raised against it. Every field the
 * rulebook cross-checks lives on this one screen, so the mismatch is visible
 * rather than described.
 */
export default function DocCompare({ vehicle }: { vehicle: Vehicle }) {
  const chassisMismatch = vehicle.checks.chassisMatch === "MISMATCH";
  const raised = vehicle.dispatch.status !== "NOT_RAISED";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Tax invoice
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
              other={vehicle.dispatch.chassisOnDocs}
              highlight={chassisMismatch}
            />
          </Row>
          <Row label="Dealer" mono>{vehicle.dealerCode}</Row>
          <Row label="Amount" mono>{formatINR(vehicle.invoice.amount)}</Row>
          <Row label="GST" mono>{formatINR(vehicle.invoice.gst)}</Row>
          <Row label="IRN">
            <span className="font-mono-vin text-xs text-ink-muted">
              {vehicle.invoice.irn || "—"}
            </span>
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
            Dispatch papers
          </h3>
          <StatusChip
            tone={
              vehicle.dispatch.status === "RAISED"
                ? "clear"
                : vehicle.dispatch.status === "MISMATCH"
                  ? "stuck"
                  : "pending"
            }
          >
            {vehicle.dispatch.status === "NOT_RAISED" ? "NOT RAISED" : vehicle.dispatch.status}
          </StatusChip>
        </div>

        {raised ? (
          <dl className="mt-3 flex flex-col gap-2.5">
            <Row label="E-way bill" mono>{vehicle.dispatch.ewbNo ?? "—"}</Row>
            <Row label="Delivery challan" mono>{vehicle.dispatch.challanNo ?? "—"}</Row>
            <Row label="Chassis on papers">
              {vehicle.dispatch.chassisOnDocs ? (
                <ChassisValue
                  value={vehicle.dispatch.chassisOnDocs}
                  other={vehicle.chassisShort}
                  highlight={chassisMismatch}
                />
              ) : (
                "—"
              )}
            </Row>
            <Row label="Valid till" mono>{vehicle.dispatch.validTill ?? "—"}</Row>
            <Row label="Raised" mono>
              {vehicle.dispatch.raisedAt ? formatDateTime(vehicle.dispatch.raisedAt) : "—"}
            </Row>
            <Row label="Carrier" mono>{vehicle.lsp?.truckNo ?? "not assigned"}</Row>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-ink-muted">
            No e-way bill or delivery challan has been raised yet — the plant raises both once
            every cross-document check is clear.
          </p>
        )}
      </div>
    </div>
  );
}
