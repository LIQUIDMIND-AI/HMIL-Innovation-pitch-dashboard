"use client";

import { evaluateVehicle, SLA_BY_ID } from "@/lib/sla";
import type { SlaOutcome, Vehicle } from "@/lib/types";
import StatusChip from "./StatusChip";

const TONE: Record<SlaOutcome, "clear" | "stuck" | "pending" | "neutral"> = {
  MET: "clear",
  BREACHED: "stuck",
  AT_RISK: "pending",
  RUNNING: "neutral",
  NOT_STARTED: "neutral",
};

const LABEL: Record<SlaOutcome, string> = {
  MET: "met",
  BREACHED: "breached",
  AT_RISK: "at risk",
  RUNNING: "running",
  NOT_STARTED: "—",
};

/** Every measured leg on one car: what was promised, what it actually took. */
export default function VehicleSlaStrip({ vehicle }: { vehicle: Vehicle }) {
  const results = evaluateVehicle(vehicle);
  if (results.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {results.map((r) => {
        const sla = SLA_BY_ID.get(r.slaId);
        if (!sla) return null;
        return (
          <li
            key={r.slaId}
            className="flex items-center gap-2 rounded-lg border border-border bg-canvas px-2.5 py-1.5"
            title={sla.intent}
          >
            <span className="text-xs text-ink">{sla.label}</span>
            <span className="font-mono-vin text-xs text-ink-muted">
              {r.elapsedHours}h / {r.targetHours}h
            </span>
            <StatusChip tone={TONE[r.outcome]}>{LABEL[r.outcome]}</StatusChip>
          </li>
        );
      })}
    </ul>
  );
}
