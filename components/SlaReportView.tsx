"use client";

import Link from "next/link";
import type { SlaReport } from "@/lib/sla";
import StatusChip from "./StatusChip";

function Stat({
  label,
  value,
  tone = "text-ink",
}: {
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className={`font-display mt-1.5 text-[40px] leading-none tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}

/**
 * The SLA scoreboard: the promised turnarounds for the goods and document flow,
 * how many legs met them, and exactly which cars blew through.
 */
export default function SlaReportView({ report }: { report: SlaReport }) {
  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Stat label="SLA attainment" value={`${report.attainment}%`} />
        <Stat label="Legs met" value={report.met} tone="text-clear" />
        <Stat label="Legs breached" value={report.breached} tone="text-stuck" />
        <Stat label="At risk now" value={report.atRisk} tone="text-pending" />
      </dl>

      <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-ink-muted">
              <th scope="col" className="px-4 py-2 font-medium">Service level</th>
              <th scope="col" className="px-4 py-2 font-medium tabular-nums">Target</th>
              <th scope="col" className="px-4 py-2 font-medium tabular-nums">Avg actual</th>
              <th scope="col" className="px-4 py-2 font-medium tabular-nums">Met</th>
              <th scope="col" className="px-4 py-2 font-medium tabular-nums">Breached</th>
              <th scope="col" className="px-4 py-2 font-medium">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {report.byRule.map(({ sla, met, breached, atRisk, running, avgHours, breachedVins }) => (
              <tr key={sla.id} className="border-b border-border align-top last:border-0">
                <td className="px-4 py-3">
                  <span className="font-mono-vin text-xs text-ink-muted">{sla.id}</span>
                  <span className="mt-0.5 block text-sm text-ink">{sla.label}</span>
                  <span className="mt-0.5 block max-w-md text-xs text-ink-muted">{sla.intent}</span>
                </td>
                <td className="font-mono-vin px-4 py-3 tabular-nums text-ink">
                  {sla.targetHours}h
                </td>
                <td
                  className={`font-mono-vin px-4 py-3 tabular-nums ${
                    avgHours !== null && avgHours > sla.targetHours ? "text-stuck" : "text-ink"
                  }`}
                >
                  {avgHours === null ? "—" : `${avgHours}h`}
                </td>
                <td className="font-mono-vin px-4 py-3 tabular-nums text-clear">{met}</td>
                <td
                  className={`font-mono-vin px-4 py-3 tabular-nums ${
                    breached > 0 ? "text-stuck" : "text-ink-muted"
                  }`}
                >
                  {breached}
                  {breachedVins.length > 0 && (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {breachedVins.map((vin) => (
                        <Link
                          key={vin}
                          href={`/vehicle/${vin}`}
                          className="font-mono-vin rounded border border-border px-1.5 py-0.5 text-[11px] text-ink-muted hover:bg-role-tint hover:text-ink"
                        >
                          •••{vin.slice(-4)}
                        </Link>
                      ))}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusChip tone={breached > 0 ? "stuck" : atRisk > 0 ? "pending" : "clear"}>
                    {breached > 0 ? "Breached" : atRisk > 0 ? "At risk" : "Met"}
                  </StatusChip>
                  {running > 0 && (
                    <span className="mt-1 block text-[11px] text-ink-muted">{running} running</span>
                  )}
                </td>
              </tr>
            ))}
            {report.byRule.every((r) => r.met + r.breached + r.atRisk + r.running === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-ink-muted">
                  No car in this scope has entered a measured leg yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {report.offenders.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h3 className="text-sm font-semibold text-ink">Cars past a promised turnaround</h3>
          <ul className="mt-3 flex flex-col gap-2">
            {report.offenders.map(({ vin, breaches }) => (
              <li key={vin} className="flex flex-wrap items-center gap-2 text-sm">
                <Link
                  href={`/vehicle/${vin}`}
                  className="font-mono-vin rounded-lg border border-border px-2 py-1 text-xs text-ink hover:bg-role-tint"
                >
                  •••{vin.slice(-4)}
                </Link>
                {breaches.map((b) => (
                  <span key={b.slaId} className="text-xs text-ink-muted">
                    <span className="font-mono-vin text-stuck">{b.slaId}</span>{" "}
                    <span className="font-mono-vin">
                      {b.elapsedHours}h / {b.targetHours}h
                    </span>
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
