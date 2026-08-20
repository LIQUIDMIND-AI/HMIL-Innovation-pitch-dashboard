"use client";

import { Car } from "lucide-react";
import { STAGE_LABELS, STAGE_ORDER, type Stage, type Vehicle } from "@/lib/types";

export type RailSize = "mini" | "compact" | "full";

/** Short, fixed-width-friendly labels — the rail reads as an instrument, not prose. */
const RAIL_LABELS: Record<Stage, string> = {
  ...STAGE_LABELS,
  ALLOCATION_MATCHED: "Allocation",
  DOCS_VERIFIED: "Docs OK",
  DISPATCH_READY: "Papers",
  IN_TRANSIT: "Transit",
};

const SIZES = {
  mini: { dot: "h-1.5 w-1.5", ring: "h-3 w-3", car: "h-3 w-3", carTop: "-top-3.5", track: "h-3" },
  compact: { dot: "h-2 w-2", ring: "h-4 w-4", car: "h-3.5 w-3.5", carTop: "-top-4", track: "h-4" },
  full: { dot: "h-2.5 w-2.5", ring: "h-5 w-5", car: "h-5 w-5", carTop: "-top-6", track: "h-5" },
} as const;

function stageTime(vehicle: Vehicle, stage: Stage): string | null {
  const iso = vehicle.stageTimestamps[stage];
  if (!iso) return null;
  // Timestamps are fixed ISO strings in mock data — slice, don't parse, so the
  // rail renders identically in every timezone.
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)} ${iso.slice(11, 16)}`;
}

/**
 * The VIN Journey Rail — DhanFlow's signature element. Identical grammar at all
 * three sizes: stages behind the car filled in the role hue, stages ahead hollow,
 * a car glyph parked on the current stage, and a red pulse when the record is stuck.
 */
export default function JourneyRail({
  vehicle,
  size = "compact",
  showTimestamps = false,
  className = "",
}: {
  vehicle: Vehicle;
  size?: RailSize;
  showTimestamps?: boolean;
  className?: string;
}) {
  const currentIndex = STAGE_ORDER.indexOf(vehicle.stage);
  const stuck = vehicle.overall === "STUCK";
  const s = SIZES[size];

  return (
    <ol
      className={`flex w-full items-start ${className}`}
      aria-label={`Journey: ${STAGE_LABELS[vehicle.stage]}${stuck ? " — stuck" : ""}`}
    >
      {STAGE_ORDER.map((stage, i) => {
        const passed = i < currentIndex;
        const current = i === currentIndex;
        const reached = passed || current;
        const time = showTimestamps ? stageTime(vehicle, stage) : null;

        return (
          <li key={stage} className="relative min-w-0 flex-1">
            <div className={`flex items-center ${s.track}`}>
              <span
                aria-hidden="true"
                className={`h-0.5 flex-1 rounded-full ${i === 0 ? "opacity-0" : ""} ${
                  reached ? "bg-role" : "bg-border"
                }`}
              />
              <span
                className={`flex ${s.ring} shrink-0 items-center justify-center rounded-full ${
                  current && stuck ? "animate-mismatch" : ""
                }`}
              >
                <span
                  className={`${s.dot} rounded-full ${
                    current && stuck
                      ? "bg-stuck ring-2 ring-stuck/25"
                      : current
                        ? "bg-role ring-2 ring-role/25"
                        : passed
                          ? "bg-role"
                          : "border border-border bg-surface"
                  }`}
                />
              </span>
              <span
                aria-hidden="true"
                className={`h-0.5 flex-1 rounded-full ${
                  i === STAGE_ORDER.length - 1 ? "opacity-0" : ""
                } ${passed ? "bg-role" : "bg-border"}`}
              />
            </div>

            {current && (
              <span
                aria-hidden="true"
                className={`animate-rail-car absolute ${s.carTop} left-1/2 -translate-x-1/2 ${
                  stuck ? "text-stuck" : "text-role"
                }`}
              >
                <Car className={s.car} />
              </span>
            )}

            {size === "full" && (
              <div className="mt-2 px-0.5 text-center">
                <span
                  className={`font-mono-vin block truncate text-[10px] uppercase leading-tight tracking-tight ${
                    current ? (stuck ? "text-stuck" : "text-role") : reached ? "text-ink" : "text-ink-muted"
                  }`}
                  title={STAGE_LABELS[stage]}
                >
                  {RAIL_LABELS[stage]}
                </span>
                {time && (
                  <span className="font-mono-vin mt-0.5 block truncate text-[10px] text-ink-muted">
                    {time}
                  </span>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
