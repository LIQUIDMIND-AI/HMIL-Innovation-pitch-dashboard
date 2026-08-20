"use client";

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { DOC_LABELS, type ComplianceDoc, type ComplianceFinding, type Role } from "@/lib/types";
import { PERSONAS } from "@/lib/auth";
import StatusChip from "./StatusChip";

const ROLE_LABEL: Record<Role, string> = PERSONAS.reduce(
  (acc, p) => ({ ...acc, [p.role]: p.label }),
  {} as Record<Role, string>
);

function fieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/**
 * Every document on a car, with who raised it and who it reached. Fields
 * implicated in an open finding are called out inline — the reviewer never has
 * to hold two documents side by side in their head.
 */
export default function DocumentList({
  docs,
  findings,
}: {
  docs: ComplianceDoc[];
  findings: ComplianceFinding[];
}) {
  const [open, setOpen] = useState<string | null>(docs[0]?.id ?? null);

  if (docs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-ink-muted">
        No documents have been raised on this car yet.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {docs.map((doc) => {
        const related = findings.filter((f) => f.docs.includes(doc.kind));
        const expanded = open === doc.id;
        return (
          <li key={doc.id} className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : doc.id)}
              aria-expanded={expanded}
              className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas"
            >
              <FileText className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink">
                  {DOC_LABELS[doc.kind]}
                </span>
                <span className="font-mono-vin block truncate text-xs text-ink-muted">
                  {doc.reference} · raised by {ROLE_LABEL[doc.issuedBy]}
                </span>
              </span>
              {related.length > 0 && (
                <StatusChip tone={related.some((f) => f.severity === "CRITICAL") ? "stuck" : "pending"}>
                  {related.length} finding{related.length === 1 ? "" : "s"}
                </StatusChip>
              )}
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${expanded ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {expanded && (
              <div className="border-t border-border px-4 py-3">
                <p className="text-xs text-ink-muted">
                  Shared with{" "}
                  {doc.sharedWith.map((r) => ROLE_LABEL[r]).join(", ") || "no one else"} ·{" "}
                  <span className="font-mono-vin">{doc.issuedAt.slice(0, 10)}</span>
                </p>
                <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  {Object.entries(doc.fields).map(([key, value]) => {
                    const flagged = related.find((f) => f.field?.includes(key));
                    return (
                      <div key={key} className="flex items-baseline justify-between gap-3">
                        <dt className="text-xs text-ink-muted">{fieldLabel(key)}</dt>
                        <dd
                          className={`font-mono-vin truncate text-right text-xs ${
                            flagged ? "rounded-[4px] bg-stuck/10 px-1 text-stuck ring-1 ring-stuck/40" : "text-ink"
                          }`}
                        >
                          {value || "—"}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
