import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import { getVehicleAgeHours, isSubstitutionCase } from "@/lib/selectors";

export default function ExceptionList({ vehicles }: { vehicles: Vehicle[] }) {
  const stuck = vehicles
    .filter((v) => v.overall === "STUCK")
    .sort((a, b) => (getVehicleAgeHours(b) ?? 0) - (getVehicleAgeHours(a) ?? 0));

  if (stuck.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-surface p-6 text-sm text-ink-muted">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-clear" aria-hidden="true" />
        No exceptions — every vehicle in view is clear.
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
      {stuck.map((v) => {
        const age = getVehicleAgeHours(v);
        const substitution = isSubstitutionCase(v);
        return (
          <li key={v.vin}>
            <Link
              href={`/vehicle/${v.vin}`}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-navy-light/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
            >
              <AlertTriangle
                className={`mt-0.5 h-4 w-4 shrink-0 ${substitution ? "text-pending" : "text-stuck"}`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-ink">
                    {v.model} {v.variant}
                  </span>
                  <span className="font-mono-vin text-xs text-ink-muted">•••{v.chassisShort}</span>
                  <span className="text-xs text-ink-muted">{v.dealerName}</span>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">{v.stuckReason}</p>
              </div>
              {age !== null && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${
                    age > 72 ? "bg-stuck-bg text-stuck" : "bg-pending-bg text-pending"
                  }`}
                >
                  {age}h ago
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
