import { DEMO_NOW } from "./mockData";
import {
  STAGE_ORDER,
  type SlaDefinition,
  type SlaOutcome,
  type SlaResult,
  type Stage,
  type Vehicle,
} from "./types";

/**
 * The promised turnarounds for the goods and document flow. These are the mock
 * SLAs the whole demo is measured against — every dashboard timer, every
 * "past SLA" badge and the SLA report all read from this one table.
 */
export const SLAS: SlaDefinition[] = [
  {
    id: "SLA-01",
    label: "Invoice → allocation matched",
    intent: "The invoice must be tied to a real allocation before anything else moves.",
    from: "INVOICED",
    to: "ALLOCATION_MATCHED",
    targetHours: 4,
  },
  {
    id: "SLA-02",
    label: "Allocation → documents verified",
    intent: "Every cross-document check clears within two days, or the car silently ages in the yard.",
    from: "ALLOCATION_MATCHED",
    to: "DOCS_VERIFIED",
    targetHours: 48,
  },
  {
    id: "SLA-03",
    label: "Documents verified → dispatch papers",
    intent: "Once the paperwork is clean, the e-way bill and challan should follow within a day.",
    from: "DOCS_VERIFIED",
    to: "DISPATCH_READY",
    targetHours: 24,
  },
  {
    id: "SLA-04",
    label: "Dispatch papers → gate-out",
    intent: "A car with valid papers should be on a carrier, not standing in the plant yard.",
    from: "DISPATCH_READY",
    to: "GATE_OUT",
    targetHours: 24,
  },
  {
    id: "SLA-05",
    label: "Gate-out → delivered",
    intent: "The line-haul promise to the dealer: five days from the gate to the yard.",
    from: "GATE_OUT",
    to: "DELIVERED",
    targetHours: 120,
  },
  {
    id: "SLA-06",
    label: "Invoice → delivered (end to end)",
    intent: "The number the dealer actually feels: seven days from invoice to keys.",
    from: "INVOICED",
    to: "DELIVERED",
    targetHours: 168,
  },
];

export const SLA_BY_ID = new Map(SLAS.map((s) => [s.id, s]));

/** Hours between two fixed ISO instants. */
function hoursBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 36e5);
}

function hasReached(vehicle: Vehicle, stage: Stage): boolean {
  return STAGE_ORDER.indexOf(vehicle.stage) >= STAGE_ORDER.indexOf(stage);
}

/**
 * Evaluates one SLA against one car. A leg that has finished is MET or
 * BREACHED for good; a leg still running is measured against the demo clock, so
 * a car sitting past its target reads BREACHED before anyone has to notice it.
 */
export function evaluateSla(vehicle: Vehicle, sla: SlaDefinition): SlaResult {
  const start = vehicle.stageTimestamps[sla.from];
  const end = vehicle.stageTimestamps[sla.to];

  if (!start) {
    return { slaId: sla.id, vin: vehicle.vin, outcome: "NOT_STARTED", elapsedHours: null, targetHours: sla.targetHours };
  }

  if (end) {
    const elapsed = hoursBetween(start, end);
    return {
      slaId: sla.id,
      vin: vehicle.vin,
      outcome: elapsed <= sla.targetHours ? "MET" : "BREACHED",
      elapsedHours: elapsed,
      targetHours: sla.targetHours,
    };
  }

  // Still open. Cars that have already moved past the target stage without a
  // timestamp are treated as not applicable rather than perpetually running.
  if (hasReached(vehicle, sla.to)) {
    return { slaId: sla.id, vin: vehicle.vin, outcome: "NOT_STARTED", elapsedHours: null, targetHours: sla.targetHours };
  }

  const elapsed = hoursBetween(start, DEMO_NOW);
  const outcome: SlaOutcome =
    elapsed > sla.targetHours ? "BREACHED" : elapsed > sla.targetHours * 0.75 ? "AT_RISK" : "RUNNING";
  return { slaId: sla.id, vin: vehicle.vin, outcome, elapsedHours: elapsed, targetHours: sla.targetHours };
}

export function evaluateVehicle(vehicle: Vehicle): SlaResult[] {
  return SLAS.map((sla) => evaluateSla(vehicle, sla)).filter((r) => r.outcome !== "NOT_STARTED");
}

export interface SlaRuleSummary {
  sla: SlaDefinition;
  met: number;
  breached: number;
  atRisk: number;
  running: number;
  /** Average hours over the legs that actually completed. */
  avgHours: number | null;
  breachedVins: string[];
}

export interface SlaReport {
  asOf: string;
  vehiclesChecked: number;
  measured: number;
  met: number;
  breached: number;
  atRisk: number;
  /** 0–100 over completed + open legs, excluding legs that never started. */
  attainment: number;
  byRule: SlaRuleSummary[];
  /** Cars carrying at least one breached leg, worst first. */
  offenders: { vin: string; breaches: SlaResult[] }[];
}

/** The SLA scoreboard for an already role-scoped vehicle list. */
export function buildSlaReport(vehicles: Vehicle[]): SlaReport {
  const results = vehicles.flatMap((v) => evaluateVehicle(v).map((r) => ({ ...r, vehicle: v })));

  const byRule: SlaRuleSummary[] = SLAS.map((sla) => {
    const hits = results.filter((r) => r.slaId === sla.id);
    const completed = hits.filter((r) => r.outcome === "MET" || r.outcome === "BREACHED");
    return {
      sla,
      met: hits.filter((r) => r.outcome === "MET").length,
      breached: hits.filter((r) => r.outcome === "BREACHED").length,
      atRisk: hits.filter((r) => r.outcome === "AT_RISK").length,
      running: hits.filter((r) => r.outcome === "RUNNING").length,
      avgHours:
        completed.length === 0
          ? null
          : Math.round(completed.reduce((sum, r) => sum + (r.elapsedHours ?? 0), 0) / completed.length),
      breachedVins: hits.filter((r) => r.outcome === "BREACHED").map((r) => r.vin),
    };
  });

  const met = results.filter((r) => r.outcome === "MET").length;
  const breached = results.filter((r) => r.outcome === "BREACHED").length;
  const atRisk = results.filter((r) => r.outcome === "AT_RISK").length;
  const measured = results.length;

  const offenders = vehicles
    .map((v) => ({ vin: v.vin, breaches: evaluateVehicle(v).filter((r) => r.outcome === "BREACHED") }))
    .filter((o) => o.breaches.length > 0)
    .sort((a, b) => b.breaches.length - a.breaches.length);

  return {
    asOf: DEMO_NOW,
    vehiclesChecked: vehicles.length,
    measured,
    met,
    breached,
    atRisk,
    attainment: measured === 0 ? 100 : Math.round((met / (met + breached || 1)) * 100),
    byRule,
    offenders,
  };
}

/** Worst open outcome on a car — drives the "past SLA" badge on cards and rails. */
export function worstOutcome(vehicle: Vehicle): SlaOutcome {
  const results = evaluateVehicle(vehicle);
  if (results.some((r) => r.outcome === "BREACHED")) return "BREACHED";
  if (results.some((r) => r.outcome === "AT_RISK")) return "AT_RISK";
  if (results.some((r) => r.outcome === "RUNNING")) return "RUNNING";
  return "MET";
}
