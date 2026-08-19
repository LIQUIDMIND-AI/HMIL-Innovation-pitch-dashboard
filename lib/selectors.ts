import { DEALERS } from "./mockData";
import { VEHICLES } from "./mockData";
import type { Role, Vehicle } from "./types";

/**
 * The one demo persona each non-HQ/RO role is scoped to. This is a fixed-cast
 * demo (one dealer, one bank, one LSP, one region) — see plan.md §3.
 */
const PLANT_STAGES = new Set<Vehicle["stage"]>([
  "INVOICED",
  "ALLOCATION_MATCHED",
  "FUNDING_PENDING",
  "FUNDING_RECEIVED",
]);

const DEALER_SCOPE_CODE = DEALERS.KRISHNA.dealerCode;
const BANK_SCOPE_NAME = DEALERS.KRISHNA.bankName;
const RO_SCOPE_REGION = DEALERS.KRISHNA.region;
const LSP_SCOPE_NAME = "Speedline Logistics";

/**
 * Single choke point for role-scoped data reads. Pages and components must
 * call this instead of importing VEHICLES directly — that is what makes role
 * isolation structural rather than a UI-only convention.
 */
export function getVehiclesForRole(role: Role): Vehicle[] {
  switch (role) {
    case "hq":
      return [...VEHICLES];
    case "plant":
      return VEHICLES.filter((v) => PLANT_STAGES.has(v.stage));
    case "ro":
      return VEHICLES.filter((v) => v.region === RO_SCOPE_REGION);
    case "dealer":
      return VEHICLES.filter((v) => v.dealerCode === DEALER_SCOPE_CODE);
    case "bank":
      return VEHICLES.filter((v) => v.bank.name === BANK_SCOPE_NAME);
    case "lsp":
      return VEHICLES.filter((v) => v.lsp?.name === LSP_SCOPE_NAME);
    default:
      return [];
  }
}

/** Role-scoped single-vehicle lookup — returns undefined if out of scope, never leaks data across roles. */
export function getVehicleForRole(role: Role, vin: string): Vehicle | undefined {
  return getVehiclesForRole(role).find((v) => v.vin === vin);
}

export function getExceptionsForRole(role: Role): Vehicle[] {
  return getVehiclesForRole(role).filter((v) => v.overall === "STUCK");
}

export function isSubstitutionCase(vehicle: Vehicle): boolean {
  return Boolean(vehicle.stuckReason?.toLowerCase().includes("substitut"));
}

/** ms since a given ISO timestamp, measured against the fixed demo clock (see DEMO_NOW). */
export function hoursSince(iso: string, demoNowIso: string): number {
  const diffMs = new Date(demoNowIso).getTime() - new Date(iso).getTime();
  return Math.round(diffMs / (1000 * 60 * 60));
}

export function groupByStage(vehicles: Vehicle[]): Record<Vehicle["stage"], Vehicle[]> {
  const groups: Record<Vehicle["stage"], Vehicle[]> = {
    INVOICED: [],
    ALLOCATION_MATCHED: [],
    FUNDING_PENDING: [],
    FUNDING_RECEIVED: [],
    GATE_OUT: [],
    IN_TRANSIT: [],
    DELIVERED: [],
  };
  for (const vehicle of vehicles) {
    groups[vehicle.stage].push(vehicle);
  }
  return groups;
}

export function getRegionalDealerRollup(
  vehicles: Vehicle[]
): { dealerCode: string; dealerName: string; total: number; stuck: number }[] {
  const byDealer = new Map<string, { dealerName: string; total: number; stuck: number }>();
  for (const v of vehicles) {
    const entry = byDealer.get(v.dealerCode) ?? {
      dealerName: v.dealerName,
      total: 0,
      stuck: 0,
    };
    entry.total += 1;
    if (v.overall === "STUCK") entry.stuck += 1;
    byDealer.set(v.dealerCode, entry);
  }
  return Array.from(byDealer.entries()).map(([dealerCode, v]) => ({
    dealerCode,
    ...v,
  }));
}

/** Unit-sanity: run once at import time in dev to catch role-scoping regressions early. */
if (process.env.NODE_ENV !== "production") {
  const counts = (["hq", "plant", "ro", "dealer", "bank", "lsp"] as Role[]).map(
    (role) => `${role}=${getVehiclesForRole(role).length}`
  );
  console.log(`[selectors] vehicle counts per role → ${counts.join(", ")}`);
}
