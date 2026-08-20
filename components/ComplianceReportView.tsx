"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import type { ComplianceReport } from "@/lib/compliance";
import { formatDateTime } from "@/lib/format";
import StatusChip from "./StatusChip";

function Stat({ label, value, tone = "text-ink" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className={`font-display mt-1.5 text-[40px] leading-none tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}

/**
 * The end-of-run compliance report: one headline number, then the rules that
 * fired and the dealers carrying them. This is the artefact the audit trail
 * hands over at the end of a cycle.
 */
export default function ComplianceReportView({ report }: { report: ComplianceReport }) {
  const { persona } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl leading-tight text-ink">
              Document compliance report
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              {report.rulesRun} rules run across{" "}
              <span className="font-mono-vin text-ink">{report.docsChecked}</span> documents on{" "}
              <span className="font-mono-vin text-ink">{report.vehiclesChecked}</span> cars ·
              scope: {persona?.label} · as of{" "}
              <span className="font-mono-vin">{formatDateTime(report.asOf)}</span>
            </p>
          </div>
          <StatusChip
            tone={report.withCritical > 0 ? "stuck" : report.withWarningOnly > 0 ? "pending" : "clear"}
          >
            {report.withCritical > 0
              ? `${report.withCritical} car${report.withCritical === 1 ? "" : "s"} blocked`
              : report.withWarningOnly > 0
                ? "Warnings only"
                : "All clear"}
          </StatusChip>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Stat label="Compliance rate" value={`${report.complianceRate}%`} />
        <Stat label="Fully compliant" value={report.clean} tone="text-clear" />
        <Stat
          label="Critical findings"
          value={report.findings.filter((f) => f.severity === "CRITICAL").length}
          tone="text-stuck"
        />
        <Stat
          label="Warnings"
          value={report.findings.filter((f) => f.severity === "WARNING").length}
          tone="text-pending"
        />
      </dl>

      <section aria-labelledby="by-rule">
        <h3 id="by-rule" className="mb-2 text-sm font-semibold text-ink">
          Rules that fired
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th scope="col" className="px-4 py-2 font-medium">Rule</th>
                <th scope="col" className="px-4 py-2 font-medium">Why it matters</th>
                <th scope="col" className="px-4 py-2 font-medium">Severity</th>
                <th scope="col" className="px-4 py-2 font-medium tabular-nums">Cars</th>
              </tr>
            </thead>
            <tbody>
              {report.byRule.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-ink-muted">
                    No rule fired in this scope.
                  </td>
                </tr>
              )}
              {report.byRule.map(({ rule, count, vins }) => (
                <tr key={rule.id} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3">
                    <span className="font-mono-vin text-xs text-ink-muted">{rule.id}</span>
                    <span className="mt-0.5 block text-sm text-ink">{rule.title}</span>
                  </td>
                  <td className="max-w-md px-4 py-3 text-xs text-ink-muted">{rule.intent}</td>
                  <td className="px-4 py-3">
                    <StatusChip tone={rule.severity === "CRITICAL" ? "stuck" : "pending"}>
                      {rule.severity}
                    </StatusChip>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono-vin tabular-nums text-ink">{count}</span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      {vins.map((vin) => (
                        <Link
                          key={vin}
                          href={`/vehicle/${vin}`}
                          className="font-mono-vin rounded border border-border px-1.5 py-0.5 text-[11px] text-ink-muted hover:bg-role-tint hover:text-ink"
                        >
                          •••{vin.slice(-4)}
                        </Link>
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="by-dealer">
        <h3 id="by-dealer" className="mb-2 text-sm font-semibold text-ink">
          By dealer
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th scope="col" className="px-4 py-2 font-medium">Dealer</th>
                <th scope="col" className="px-4 py-2 font-medium tabular-nums">Cars checked</th>
                <th scope="col" className="px-4 py-2 font-medium tabular-nums">Critical</th>
                <th scope="col" className="px-4 py-2 font-medium tabular-nums">Warnings</th>
              </tr>
            </thead>
            <tbody>
              {report.byDealer.map((row) => (
                <tr key={row.dealerCode} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-ink">
                    {row.dealerName}
                    <span className="font-mono-vin ml-2 text-xs text-ink-muted">{row.dealerCode}</span>
                  </td>
                  <td className="font-mono-vin px-4 py-2 tabular-nums text-ink">{row.checked}</td>
                  <td className={`font-mono-vin px-4 py-2 tabular-nums ${row.critical > 0 ? "text-stuck" : "text-ink-muted"}`}>
                    {row.critical}
                  </td>
                  <td className={`font-mono-vin px-4 py-2 tabular-nums ${row.warning > 0 ? "text-pending" : "text-ink-muted"}`}>
                    {row.warning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
