"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useVehicleStore } from "@/lib/store";
import { computeAtp } from "@/lib/erp";
import { ORDER_STATUS_LABELS, type ChipTone, type Order } from "@/lib/types";
import AtpPanel from "./AtpPanel";
import StatusChip from "./StatusChip";

const STATUS_TONE: Record<Order["status"], ChipTone> = {
  SUBMITTED: "pending",
  VERIFIED: "clear",
  REJECTED: "stuck",
  INVOICED: "neutral",
};

const PRIMARY =
  "min-h-11 rounded-lg bg-role px-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
const SECONDARY =
  "min-h-11 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-canvas";

/**
 * One order, read by whoever is looking at it. The dealer sees the promise; the
 * manufacturer sees the same promise plus the controls to make or refuse it.
 */
export default function OrderCard({ order }: { order: Order }) {
  const { role, persona } = useAuth();
  const { verifyOrder, rejectOrder, raiseInvoiceForOrder } = useVehicleStore();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const isManufacturer = role === "hq";
  const plan = order.plan ?? computeAtp(order);
  const canVerify = isManufacturer && order.status === "SUBMITTED" && plan.verdict !== "CONSTRAINED";
  const canInvoice = isManufacturer && order.status === "VERIFIED";

  return (
    <li className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-vin text-sm font-semibold text-ink">{order.id}</span>
            <StatusChip tone={STATUS_TONE[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </StatusChip>
          </div>
          <p className="mt-1 text-sm text-ink">
            {order.qty} × {order.model} {order.variant} · {order.colour}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {order.dealerName} · {order.reference} · booked by {order.placedBy} on{" "}
            <span className="font-mono-vin">{order.placedAt.slice(0, 10)}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-ink-muted">Wanted by</p>
          <p className="font-mono-vin text-sm text-ink">{order.requestedDelivery}</p>
        </div>
      </div>

      <div className="mt-3">
        <AtpPanel order={order} plan={order.status === "SUBMITTED" ? undefined : order.plan} />
      </div>

      {order.rejectionReason && (
        <p className="mt-3 rounded-lg border border-stuck/30 bg-stuck-bg px-3 py-2 text-xs text-stuck">
          {order.rejectionReason}
        </p>
      )}

      {order.invoicedVins.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wide text-ink-muted">Invoiced against</p>
          <ul className="mt-1.5 flex flex-wrap gap-2">
            {order.invoicedVins.map((vin) => (
              <li key={vin}>
                <Link
                  href={`/vehicle/${vin}`}
                  className="font-mono-vin inline-flex min-h-11 items-center rounded-lg border border-border bg-canvas px-3 text-xs text-ink hover:bg-role-tint"
                >
                  •••{vin.slice(-4)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {order.verifiedBy && (
        <p className="mt-3 text-xs text-ink-muted">
          {order.status === "REJECTED" ? "Rejected" : "Verified"} by {order.verifiedBy} on{" "}
          <span className="font-mono-vin">{order.verifiedAt?.slice(0, 10)}</span>
        </p>
      )}

      {isManufacturer && (order.status === "SUBMITTED" || canInvoice) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
          {canVerify && (
            <button
              type="button"
              className={PRIMARY}
              onClick={() => verifyOrder(order.id, plan, persona?.name ?? "HQ")}
            >
              Verify &amp; confirm slot
            </button>
          )}
          {canInvoice && (
            <button
              type="button"
              className={PRIMARY}
              onClick={() => raiseInvoiceForOrder(order.id)}
            >
              Raise invoice ({order.qty})
            </button>
          )}
          {order.status === "SUBMITTED" && !rejecting && (
            <button
              type="button"
              className={SECONDARY}
              onClick={() => {
                setRejecting(true);
                setReason(plan.constraint ?? "");
              }}
            >
              Reject
            </button>
          )}
          {rejecting && (
            <form
              className="flex w-full flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (!reason.trim()) return;
                rejectOrder(order.id, reason.trim(), persona?.name ?? "HQ");
                setRejecting(false);
              }}
            >
              <label htmlFor={`reason-${order.id}`} className="sr-only">
                Rejection reason
              </label>
              <input
                id={`reason-${order.id}`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why can this not be promised?"
                className="min-h-11 flex-1 rounded-lg border border-border bg-canvas px-3 text-sm outline-none focus:border-role"
              />
              <button type="submit" disabled={!reason.trim()} className={PRIMARY}>
                Confirm rejection
              </button>
              <button type="button" className={SECONDARY} onClick={() => setRejecting(false)}>
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </li>
  );
}
