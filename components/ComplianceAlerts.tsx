"use client";

import Link from "next/link";
import { CheckCircle2, ShieldAlert, TriangleAlert } from "lucide-react";
import type { ComplianceFinding } from "@/lib/types";
import { DOC_LABELS } from "@/lib/types";
import StatusChip from "./StatusChip";

/** The alert feed: every open mismatch the rulebook found, criticals first. */
export default function ComplianceAlerts({
  findings,
  limit,
}: {
  findings: ComplianceFinding[];
  limit?: number;
}) {
  if (findings.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border bg-surface p-6 text-sm text-ink-muted">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-clear" aria-hidden="true" />
        Every document in view reconciles — no open compliance findings.
      </div>
    );
  }

  const shown = limit ? findings.slice(0, limit) : findings;

  return (
    <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      {shown.map((f) => (
        <li key={f.id}>
          <Link
            href={`/vehicle/${f.vin}`}
            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-role-tint/50"
          >
            {f.severity === "CRITICAL" ? (
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-stuck" aria-hidden="true" />
            ) : (
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-pending" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-ink">{f.rule}</span>
                <span className="font-mono-vin text-xs text-ink-muted">•••{f.vin.slice(-4)}</span>
                <span className="font-mono-vin text-[11px] text-ink-muted">{f.ruleId}</span>
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">{f.message}</p>
              {f.expected && (
                <p className="font-mono-vin mt-1 text-[11px] text-ink-muted">
                  expected <span className="text-ink">{f.expected}</span> · found{" "}
                  <span className="text-stuck">{f.found}</span>
                </p>
              )}
              <p className="mt-1 text-[11px] text-ink-muted">
                {f.docs.map((d) => DOC_LABELS[d]).join("  ·  ")}
              </p>
            </div>
            <StatusChip tone={f.severity === "CRITICAL" ? "stuck" : "pending"} className="shrink-0">
              {f.severity}
            </StatusChip>
          </Link>
        </li>
      ))}
      {limit && findings.length > limit && (
        <li className="px-4 py-2 text-center text-xs text-ink-muted">
          + {findings.length - limit} more
        </li>
      )}
    </ul>
  );
}
