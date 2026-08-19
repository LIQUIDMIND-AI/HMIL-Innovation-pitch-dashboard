import { DEALERS, DEMO_NOW, VEHICLES } from "./mockData";
import type { ChipTone, Role, Vehicle } from "./types";

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

/** CLEAR -> green, substitution-in-progress STUCK -> amber (distinct from a hard mismatch), everything else STUCK -> red. */
export function getVehicleTone(vehicle: Vehicle): ChipTone {
  if (vehicle.overall === "CLEAR") return "clear";
  return isSubstitutionCase(vehicle) ? "pending" : "stuck";
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

export interface KpiItem {
  label: string;
  value: string | number;
  tone?: ChipTone;
}

const DEMO_TODAY = DEMO_NOW.slice(0, 10);

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((sum, n) => sum + n, 0) / nums.length);
}

/** Role-relevant KPI strip contents (plan.md §6) — computed from role-scoped data only. */
export function getKpisForRole(role: Role): KpiItem[] {
  const vehicles = getVehiclesForRole(role);
  const stuckCount = vehicles.filter((v) => v.overall === "STUCK").length;

  switch (role) {
    case "hq": {
      const invoicedToday = vehicles.filter((v) => v.invoice.date === DEMO_TODAY).length;
      const gateOutHours = vehicles
        .filter((v) => v.stageTimestamps.GATE_OUT)
        .map((v) => hoursSince(v.stageTimestamps.INVOICED!, v.stageTimestamps.GATE_OUT!));
      const avgGateOutHours = average(gateOutHours);
      const delivered = vehicles.filter((v) => v.stage === "DELIVERED").length;
      return [
        { label: "Invoiced Today", value: invoicedToday },
        { label: "Stuck", value: stuckCount, tone: stuckCount > 0 ? "stuck" : "clear" },
        {
          label: "Avg Invoice → Gate-out",
          value: avgGateOutHours !== null ? `${avgGateOutHours}h` : "—",
        },
        { label: "Delivered", value: delivered, tone: "clear" },
      ];
    }
    case "plant": {
      const readyForGatePass = vehicles.filter(
        (v) => v.overall === "CLEAR" && v.stage === "FUNDING_RECEIVED"
      ).length;
      const substitutions = vehicles.filter(isSubstitutionCase).length;
      return [
        { label: "Awaiting Gate Pass", value: vehicles.length },
        { label: "Blocked", value: stuckCount, tone: stuckCount > 0 ? "stuck" : "clear" },
        { label: "Ready for Gate Pass", value: readyForGatePass, tone: "clear" },
        {
          label: "Substitutions",
          value: substitutions,
          tone: substitutions > 0 ? "pending" : "neutral",
        },
      ];
    }
    case "ro": {
      const dealerCount = new Set(vehicles.map((v) => v.dealerCode)).size;
      const slaBreaches = vehicles.filter(
        (v) =>
          v.stage === "FUNDING_PENDING" &&
          v.stageTimestamps.FUNDING_PENDING &&
          hoursSince(v.stageTimestamps.FUNDING_PENDING, DEMO_NOW) > 72
      ).length;
      return [
        { label: "Total Cars", value: vehicles.length },
        { label: "Stuck", value: stuckCount, tone: stuckCount > 0 ? "stuck" : "clear" },
        { label: "Dealers", value: dealerCount },
        {
          label: "SLA Breaches (>72h)",
          value: slaBreaches,
          tone: slaBreaches > 0 ? "stuck" : "clear",
        },
      ];
    }
    case "dealer": {
      const onOrder = vehicles.filter((v) => v.stage !== "DELIVERED").length;
      const arrivingThisWeek = vehicles.filter((v) => v.stage === "IN_TRANSIT").length;
      const delivered = vehicles.filter((v) => v.stage === "DELIVERED").length;
      return [
        { label: "Cars on Order", value: onOrder },
        { label: "Stuck", value: stuckCount, tone: stuckCount > 0 ? "stuck" : "clear" },
        { label: "Arriving This Week", value: arrivingThisWeek },
        { label: "Delivered", value: delivered, tone: "clear" },
      ];
    }
    case "bank": {
      const pending = vehicles.filter((v) => v.bank.status === "PENDING").length;
      const received = vehicles.filter((v) => v.bank.status === "RECEIVED").length;
      const mismatch = vehicles.filter((v) => v.bank.status === "MISMATCH").length;
      return [
        { label: "Funding Requests", value: vehicles.length },
        { label: "Pending", value: pending, tone: pending > 0 ? "pending" : "neutral" },
        { label: "Received", value: received, tone: "clear" },
        { label: "Mismatch", value: mismatch, tone: mismatch > 0 ? "stuck" : "clear" },
      ];
    }
    case "lsp": {
      const inTransit = vehicles.filter((v) => v.stage === "IN_TRANSIT").length;
      const delivered = vehicles.filter((v) => v.stage === "DELIVERED").length;
      const delayed = vehicles.filter((v) =>
        v.lsp?.lastMilestone.toLowerCase().includes("delayed")
      ).length;
      return [
        { label: "Assigned Trips", value: vehicles.length },
        { label: "In Transit", value: inTransit },
        { label: "Delivered", value: delivered, tone: "clear" },
        { label: "Delayed", value: delayed, tone: delayed > 0 ? "pending" : "clear" },
      ];
    }
    default:
      return [];
  }
}

/** Unit-sanity: run once at import time in dev to catch role-scoping regressions early. */
if (process.env.NODE_ENV !== "production") {
  const counts = (["hq", "plant", "ro", "dealer", "bank", "lsp"] as Role[]).map(
    (role) => `${role}=${getVehiclesForRole(role).length}`
  );
  console.log(`[selectors] vehicle counts per role → ${counts.join(", ")}`);
}
