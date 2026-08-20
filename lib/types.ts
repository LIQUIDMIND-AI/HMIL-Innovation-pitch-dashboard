export type Role = "hq" | "plant" | "ro" | "dealer" | "bank" | "lsp";

export type Stage =
  | "INVOICED"
  | "ALLOCATION_MATCHED"
  | "FUNDING_PENDING"
  | "FUNDING_RECEIVED"
  | "GATE_OUT"
  | "IN_TRANSIT"
  | "DELIVERED";

export const STAGE_ORDER: Stage[] = [
  "INVOICED",
  "ALLOCATION_MATCHED",
  "FUNDING_PENDING",
  "FUNDING_RECEIVED",
  "GATE_OUT",
  "IN_TRANSIT",
  "DELIVERED",
];

export const STAGE_LABELS: Record<Stage, string> = {
  INVOICED: "Invoiced",
  ALLOCATION_MATCHED: "Allocation Matched",
  FUNDING_PENDING: "Funding Pending",
  FUNDING_RECEIVED: "Funding Received",
  GATE_OUT: "Gate-out",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
};

export type CheckStatus = "CLEAR" | "MISMATCH" | "PENDING";

/** Shared semantic tone vocabulary used across status chips and KPI values. */
export type ChipTone = "clear" | "stuck" | "pending" | "neutral";

export interface Invoice {
  number: string;
  date: string;
  amount: number;
  gst: number;
  irn: string;
}

export interface BankInfo {
  name: string;
  status: "PENDING" | "RECEIVED" | "MISMATCH";
  chassisOnConfirmation?: string;
  amount?: number;
  receivedAt?: string;
}

export interface VehicleChecks {
  chassisMatch: CheckStatus;
  variantColourMatch: CheckStatus;
  priceMatch: CheckStatus;
  fundingPresent: CheckStatus;
  taxTotalsMatch: CheckStatus;
}

export interface LspInfo {
  name: string;
  truckNo: string;
  route: string;
  etaDays: number;
  lastMilestone: string;
}

export interface Note {
  author: string;
  role: string;
  text: string;
  at: string;
}

export interface Vehicle {
  vin: string;
  chassisShort: string;
  model: string;
  variant: string;
  colour: string;
  dealerCode: string;
  dealerName: string;
  region: string;
  invoice: Invoice;
  allocationRef: string;
  priceCircularRef: string;
  bank: BankInfo;
  checks: VehicleChecks;
  overall: "CLEAR" | "STUCK";
  stuckReason?: string;
  stage: Stage;
  stageTimestamps: Partial<Record<Stage, string>>;
  lsp?: LspInfo;
  notes: Note[];
}

/** A milestone on a live trip, positioned as a fraction (0–1) along the drawn route. */
export interface TripMilestone {
  label: string;
  /** Fixed ISO timestamp, or undefined for a milestone not yet passed. */
  at?: string;
  reached: boolean;
  /** Fraction along the route, 0–1 — drives the timeline below the map. */
  t: number;
  /** Hardcoded position in the map viewBox, so dots paint instantly with no path sampling. */
  cx: number;
  cy: number;
}

export interface Trip {
  id: string;
  carrier: string;
  truckNo: string;
  origin: string;
  destination: string;
  /** VINs aboard — resolved through the role-scoped selectors, never rendered raw. */
  vins: string[];
  promiseDate: string;
  etaDate: string;
  status: "ON_TIME" | "DELAYED";
  /** Days late vs the promise date; 0 when on time. */
  daysLate: number;
  /** How far along the drawn route the truck currently is, 0–1. */
  progress: number;
  /** SVG path the truck runs along, in the tracking map's viewBox. */
  path: string;
  milestones: TripMilestone[];
}
