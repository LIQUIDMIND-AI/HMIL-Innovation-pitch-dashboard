"use client";

import { Factory, PackageCheck, TriangleAlert } from "lucide-react";
import { computeAtp, slackAgainstRequest } from "@/lib/erp";
import { ATP_LABELS, type AtpPlan, type Order } from "@/lib/types";
import StatusChip from "./StatusChip";

export function atpTone(plan: AtpPlan) {
  if (plan.verdict === "CONSTRAINED") return "stuck" as const;
  if (plan.verdict === "FROM_STOCK") return "clear" as const;
  return "pending" as const;
}

function Field({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className={`font-mono-vin mt-0.5 text-sm ${tone ?? "text-ink"}`}>{value}</dd>
    </div>
  );
}

/**
 * Available-to-promise, shown the way a sales desk reads it: what can go on a
 * truck today, what has to be built, and the date that falls out of the two.
 */
/** Only the fields the check needs — so an unsubmitted draft can be previewed too. */
export type AtpSubject = Pick<Order, "model" | "variant" | "colour" | "qty" | "requestedDelivery">;

export default function AtpPanel({ order, plan }: { order: AtpSubject; plan?: AtpPlan }) {
  const atp = plan ?? computeAtp(order);
  const slack = slackAgainstRequest(atp, order.requestedDelivery);
  const late = slack !== null && slack < 0;

  return (
    <div className="rounded-lg border border-border bg-canvas p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          {atp.verdict === "CONSTRAINED" ? (
            <TriangleAlert className="h-3.5 w-3.5 text-stuck" aria-hidden="true" />
          ) : atp.verdict === "FROM_STOCK" ? (
            <PackageCheck className="h-3.5 w-3.5 text-clear" aria-hidden="true" />
          ) : (
            <Factory className="h-3.5 w-3.5 text-pending" aria-hidden="true" />
          )}
          Available to promise
        </span>
        <StatusChip tone={atpTone(atp)}>{ATP_LABELS[atp.verdict]}</StatusChip>
      </div>

      {atp.constraint ? (
        <p className="mt-2 text-xs text-stuck">{atp.constraint}</p>
      ) : (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="From stock" value={`${atp.fromStock} of ${order.qty}`} />
            <Field label="To manufacture" value={String(atp.toManufacture)} />
            <Field label="Build slot" value={atp.manufactureBy ?? "not needed"} />
            <Field label="On a truck by" value={atp.transportBy} />
          </dl>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5">
            <span className="text-xs text-ink-muted">
              Promised delivery{" "}
              <span className="font-mono-vin text-ink">{atp.promisedDelivery}</span> · dealer asked
              for <span className="font-mono-vin text-ink">{order.requestedDelivery}</span>
            </span>
            {slack !== null && (
              <StatusChip tone={late ? "pending" : "clear"}>
                {late ? `${Math.abs(slack)}d late` : `${slack}d of slack`}
              </StatusChip>
            )}
          </div>
        </>
      )}
    </div>
  );
}
