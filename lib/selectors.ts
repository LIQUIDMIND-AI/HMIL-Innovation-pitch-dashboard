import {
  AVAILABILITY,
  DEALERS,
  DEMO_NOW,
  TRIPS,
  VEHICLES,
  docKindsVisibleTo,
} from "./mockData";
import { buildComplianceReport, validateAll, type ComplianceReport } from "./compliance";
import {
  STAGE_ORDER,
  type ChipTone,
  type Role,
  type Stage,
  type ComplianceDoc,
  type ComplianceFinding,
  type Order,
  type Trip,
  type Vehicle,
} from "./types";

/** The six legs of the pipeline (plan.md §6) — FUNDING_PENDING/FUNDING_RECEIVED collapse into one "Funding" column. */
export const PIPELINE_COLUMNS: { key: string; label: string; stages: Stage[] }[] = [
  { key: "invoiced", label: "Invoiced", stages: ["INVOICED"] },
  { key: "allocation", label: "Allocation Matched", stages: ["ALLOCATION_MATCHED"] },
  { key: "funding", label: "Funding", stages: ["FUNDING_PENDING", "FUNDING_RECEIVED"] },
  { key: "gateout", label: "Gate-out", stages: ["GATE_OUT"] },
  { key: "transit", label: "In Transit", stages: ["IN_TRANSIT"] },
  { key: "delivered", label: "Delivered", stages: ["DELIVERED"] },
];

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
 * isolation structural rather than a UI-only convention. Takes a vehicle list
 * rather than reading VEHICLES itself so it works against both the static
 * seed data and the live VehicleStoreContext state.
 */
export function filterVehiclesForRole(vehicles: Vehicle[], role: Role): Vehicle[] {
  switch (role) {
    case "hq":
      return [...vehicles];
    case "plant":
      return vehicles.filter((v) => PLANT_STAGES.has(v.stage));
    case "ro":
      return vehicles.filter((v) => v.region === RO_SCOPE_REGION);
    case "dealer":
      return vehicles.filter((v) => v.dealerCode === DEALER_SCOPE_CODE);
    case "bank":
      return vehicles.filter((v) => v.bank.name === BANK_SCOPE_NAME);
    case "lsp":
      return vehicles.filter((v) => v.lsp?.name === LSP_SCOPE_NAME);
    default:
      return [];
  }
}

/** Convenience wrapper over the static seed data — used for the dev sanity check and any server-only read. */
export function getVehiclesForRole(role: Role): Vehicle[] {
  return filterVehiclesForRole(VEHICLES, role);
}

/** Role-scoped single-vehicle lookup within an arbitrary vehicle list — returns undefined if out of scope, never leaks data across roles. */
export function findVehicleForRole(
  vehicles: Vehicle[],
  role: Role,
  vin: string
): Vehicle | undefined {
  return filterVehiclesForRole(vehicles, role).find((v) => v.vin === vin);
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

/** Timestamp of the most advanced stage the vehicle has actually reached. */
export function getLatestStageTimestamp(vehicle: Vehicle): string | undefined {
  for (let i = STAGE_ORDER.length - 1; i >= 0; i -= 1) {
    const ts = vehicle.stageTimestamps[STAGE_ORDER[i]];
    if (ts) return ts;
  }
  return undefined;
}

/** Hours since the vehicle last moved, against the fixed demo clock — the exception list's age timer. */
export function getVehicleAgeHours(vehicle: Vehicle): number | null {
  const ts = getLatestStageTimestamp(vehicle);
  return ts ? hoursSince(ts, DEMO_NOW) : null;
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

/** Vehicle count per pipeline leg, in stage order — the HQ funnel-by-stage chart. */
export function getPipelineFunnel(
  vehicles: Vehicle[]
): { label: string; count: number }[] {
  return PIPELINE_COLUMNS.map((col) => ({
    label: col.label,
    count: vehicles.filter((v) => col.stages.includes(v.stage)).length,
  }));
}

/** Average hours from FUNDING_PENDING to FUNDING_RECEIVED, grouped by bank — the HQ funding-lag chart. */
export function getAvgFundingLagByBank(
  vehicles: Vehicle[]
): { bankName: string; avgHours: number }[] {
  const lagsByBank = new Map<string, number[]>();
  for (const v of vehicles) {
    const start = v.stageTimestamps.FUNDING_PENDING;
    const end = v.stageTimestamps.FUNDING_RECEIVED;
    if (!start || !end) continue;
    const lag = hoursSince(start, end);
    lagsByBank.set(v.bank.name, [...(lagsByBank.get(v.bank.name) ?? []), lag]);
  }
  return Array.from(lagsByBank.entries()).map(([bankName, lags]) => ({
    bankName,
    avgHours: Math.round(lags.reduce((sum, n) => sum + n, 0) / lags.length),
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

/**
 * Role-relevant KPI strip contents (plan.md §6). Takes an already role-scoped
 * vehicle list so it works against both the static seed data and the live
 * VehicleStoreContext state.
 */
export function getKpisFromVehicles(vehicles: Vehicle[], role: Role): KpiItem[] {
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

/** Convenience wrapper over the static seed data. */
export function getKpisForRole(role: Role): KpiItem[] {
  return getKpisFromVehicles(getVehiclesForRole(role), role);
}

/** Unit-sanity: run once at import time in dev to catch role-scoping regressions early. */
if (process.env.NODE_ENV !== "production") {
  const counts = (["hq", "plant", "ro", "dealer", "bank", "lsp"] as Role[]).map(
    (role) => `${role}=${getVehiclesForRole(role).length}`
  );
  console.log(`[selectors] vehicle counts per role → ${counts.join(", ")}`);
}

/** Deterministic time-of-day word, derived from the fixed demo clock — never the real one. */
export function getGreetingWord(): string {
  const hour = Number(DEMO_NOW.slice(11, 13));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * The one question each persona opens DhanFlow to answer, answered in one line
 * from their own role-scoped slice (build plan v3 §1.1).
 */
export function getPersonaHeadline(vehicles: Vehicle[], role: Role): string {
  const total = vehicles.length;
  const stuck = vehicles.filter((v) => v.overall === "STUCK").length;

  switch (role) {
    case "hq": {
      const dealers = new Set(vehicles.filter((v) => v.overall === "STUCK").map((v) => v.dealerCode))
        .size;
      return stuck === 0
        ? `All ${total} cars in the national pipeline are clear.`
        : `${stuck} of ${total} cars are stuck, across ${dealers} dealer${dealers === 1 ? "" : "s"}.`;
    }
    case "plant": {
      const ready = vehicles.filter(
        (v) => v.overall === "CLEAR" && v.stage === "FUNDING_RECEIVED"
      ).length;
      return `${ready} car${ready === 1 ? "" : "s"} clear for gate pass today, ${stuck} blocked on document mismatches.`;
    }
    case "ro": {
      const breaches = vehicles.filter(
        (v) =>
          v.stage === "FUNDING_PENDING" &&
          v.stageTimestamps.FUNDING_PENDING &&
          hoursSince(v.stageTimestamps.FUNDING_PENDING, DEMO_NOW) > 72
      ).length;
      return `${stuck} of ${total} cars in your region are stuck — ${breaches} past the 72-hour funding SLA.`;
    }
    case "dealer": {
      const arriving = vehicles.filter((v) => v.stage === "IN_TRANSIT").length;
      return `${stuck} of your ${total} cars are at risk — ${arriving} more arriving this week.`;
    }
    case "bank": {
      const pending = vehicles.filter((v) => v.bank.status === "PENDING").length;
      const mismatch = vehicles.filter((v) => v.bank.status === "MISMATCH").length;
      return `${pending} funding request${pending === 1 ? "" : "s"} still open, ${mismatch} flagged for a chassis mismatch.`;
    }
    case "lsp": {
      const inTransit = vehicles.filter((v) => v.stage === "IN_TRANSIT").length;
      const delayed = vehicles.filter((v) =>
        v.lsp?.lastMilestone.toLowerCase().includes("delayed")
      ).length;
      return `${inTransit} car${inTransit === 1 ? "" : "s"} on the road, ${delayed} trip${delayed === 1 ? "" : "s"} running late.`;
    }
    default:
      return "";
  }
}

/**
 * Trips a role may watch: a trip is in scope only if at least one car aboard is
 * in scope. The dealer therefore sees its own run and nothing else, while the
 * LSP sees every trip it is carrying — same rule as every other data read here.
 */
export function getTripsForRole(vehicles: Vehicle[], role: Role): Trip[] {
  const visible = new Set(filterVehiclesForRole(vehicles, role).map((v) => v.vin));
  return TRIPS.filter((trip) => trip.vins.some((vin) => visible.has(vin)));
}

/** The in-scope cars aboard a trip — never the raw trip.vins list. */
export function getTripVehicles(vehicles: Vehicle[], role: Role, trip: Trip): Vehicle[] {
  const scoped = filterVehiclesForRole(vehicles, role);
  return trip.vins
    .map((vin) => scoped.find((v) => v.vin === vin))
    .filter((v): v is Vehicle => Boolean(v));
}

/* ---------------------------------------------------------------------------
 * ERP + document scoping — same choke-point rule as the vehicle reads above
 * ------------------------------------------------------------------------ */

/**
 * Orders a role may see: the dealer sees only its own book, the RO its region,
 * the manufacturer everything, and the plant only what has actually been
 * committed to it. The bank and the transporter have no business in the order
 * book at all.
 */
export function getOrdersForRole(orders: Order[], role: Role): Order[] {
  switch (role) {
    case "hq":
      return orders;
    case "ro":
      return orders.filter((o) => o.region === RO_SCOPE_REGION);
    case "dealer":
      return orders.filter((o) => o.dealerCode === DEALER_SCOPE_CODE);
    case "plant":
      return orders.filter((o) => o.status === "VERIFIED" || o.status === "INVOICED");
    default:
      return [];
  }
}

/**
 * A document is visible when the role raised it or was shared on it — and only
 * for cars already inside that role's vehicle scope. Both conditions have to
 * hold, so a shared-with list can never widen a role's data window.
 */
export function getDocumentsForRole(
  documents: ComplianceDoc[],
  vehicles: Vehicle[],
  role: Role
): ComplianceDoc[] {
  const scoped = new Set(filterVehiclesForRole(vehicles, role).map((v) => v.vin));
  return documents.filter(
    (d) => scoped.has(d.vin) && (d.issuedBy === role || d.sharedWith.includes(role))
  );
}

export function getDocumentsForVehicle(
  documents: ComplianceDoc[],
  vehicles: Vehicle[],
  role: Role,
  vin: string
): ComplianceDoc[] {
  return getDocumentsForRole(documents, vehicles, role).filter((d) => d.vin === vin);
}

/** The compliance report as one role sees it — scoped vehicles, scoped documents. */
export function getComplianceReportForRole(
  vehicles: Vehicle[],
  documents: ComplianceDoc[],
  role: Role
): ComplianceReport {
  return buildComplianceReport(
    filterVehiclesForRole(vehicles, role),
    getDocumentsForRole(documents, vehicles, role),
    docKindsVisibleTo(role)
  );
}

/** Open findings for a role, criticals first — the alert feed. */
export function getAlertsForRole(
  vehicles: Vehicle[],
  documents: ComplianceDoc[],
  role: Role
): ComplianceFinding[] {
  return validateAll(
    filterVehiclesForRole(vehicles, role),
    getDocumentsForRole(documents, vehicles, role),
    docKindsVisibleTo(role)
  );
}

/** The production lines a dealer can book against — read through the selector layer like everything else. */
export const AVAILABLE_LINES = AVAILABILITY;

/** Findings on a single car, scoped to what the role can actually see. */
export function getAlertsForVehicle(
  vehicles: Vehicle[],
  documents: ComplianceDoc[],
  role: Role,
  vin: string
): ComplianceFinding[] {
  return getAlertsForRole(vehicles, documents, role).filter((f) => f.vin === vin);
}
