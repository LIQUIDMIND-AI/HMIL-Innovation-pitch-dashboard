/** Five parties move the goods and the paperwork. There is no money leg here. */
export type Role = "hq" | "plant" | "ro" | "dealer" | "lsp";

/**
 * The goods flow, from the invoice that commits a car to the delivery that
 * closes it. `DOCS_VERIFIED` is the paperwork gate: every cross-document check
 * has to clear before dispatch papers can be raised.
 */
export type Stage =
  | "INVOICED"
  | "ALLOCATION_MATCHED"
  | "DOCS_VERIFIED"
  | "DISPATCH_READY"
  | "GATE_OUT"
  | "IN_TRANSIT"
  | "DELIVERED";

export const STAGE_ORDER: Stage[] = [
  "INVOICED",
  "ALLOCATION_MATCHED",
  "DOCS_VERIFIED",
  "DISPATCH_READY",
  "GATE_OUT",
  "IN_TRANSIT",
  "DELIVERED",
];

export const STAGE_LABELS: Record<Stage, string> = {
  INVOICED: "Invoiced",
  ALLOCATION_MATCHED: "Allocation Matched",
  DOCS_VERIFIED: "Documents Verified",
  DISPATCH_READY: "Dispatch Papers Raised",
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

/**
 * The dispatch paperwork the plant raises to move a car: e-way bill and
 * delivery challan. `chassisOnDocs` is what those papers actually say — when it
 * disagrees with the invoice, the car does not leave the yard.
 */
export interface DispatchDocs {
  status: "NOT_RAISED" | "RAISED" | "MISMATCH";
  ewbNo?: string;
  challanNo?: string;
  chassisOnDocs?: string;
  validTill?: string;
  raisedAt?: string;
}

export interface VehicleChecks {
  chassisMatch: CheckStatus;
  variantColourMatch: CheckStatus;
  priceMatch: CheckStatus;
  taxTotalsMatch: CheckStatus;
  /** E-way bill + delivery challan raised, valid, and agreeing with the invoice. */
  dispatchDocsPresent: CheckStatus;
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
  dispatch: DispatchDocs;
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
  lat: number;
  lng: number;
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
  /** How far along the route the truck currently is, 0–1. */
  progress: number;
  /** The road corridor as [lat, lng] waypoints, drawn over OpenStreetMap tiles. */
  route: [number, number][];
  milestones: TripMilestone[];
}

/* ---------------------------------------------------------------------------
 * ERP — dealer order booking and manufacturer-side verification
 * ------------------------------------------------------------------------ */

export type OrderStatus = "SUBMITTED" | "VERIFIED" | "REJECTED" | "INVOICED";

/** How the manufacturer can promise an order line. */
export type AtpVerdict = "FROM_STOCK" | "BUILD_TO_ORDER" | "PART_STOCK" | "CONSTRAINED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  SUBMITTED: "Awaiting verification",
  VERIFIED: "Verified — slot confirmed",
  REJECTED: "Rejected",
  INVOICED: "Invoiced",
};

export const ATP_LABELS: Record<AtpVerdict, string> = {
  FROM_STOCK: "Available to transport",
  PART_STOCK: "Part stock, part build",
  BUILD_TO_ORDER: "Available to manufacture",
  CONSTRAINED: "Cannot be promised",
};

/** The manufacturer's answer to "can you build and move this, and by when?". */
export interface AtpPlan {
  verdict: AtpVerdict;
  /** Units that can ship off finished stock. */
  fromStock: number;
  /** Units that have to be built. */
  toManufacture: number;
  /** Fixed ISO dates — all derived from the demo clock, never the real one. */
  manufactureBy?: string;
  transportBy: string;
  promisedDelivery: string;
  /** Plain-English reason shown when the verdict is CONSTRAINED. */
  constraint?: string;
}

export interface Order {
  id: string;
  dealerCode: string;
  dealerName: string;
  region: string;
  model: string;
  variant: string;
  colour: string;
  qty: number;
  /** Free-text reason the dealer gave — "Diwali retail block", etc. */
  reference: string;
  requestedDelivery: string;
  placedBy: string;
  placedAt: string;
  status: OrderStatus;
  plan?: AtpPlan;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  /** VINs raised against this order once the manufacturer invoices it. */
  invoicedVins: string[];
}

/** What the plant can ship today and what it can build, per model line. */
export interface AvailabilityRecord {
  model: string;
  variant: string;
  colours: string[];
  /** Finished units standing in the yard, ready to be put on a truck. */
  readyToTransport: number;
  /** Working days until the next build slot opens. */
  buildSlotDays: number;
  /** Units the line can absorb into that slot. */
  buildSlotCapacity: number;
  /** Ex-showroom price used when the manufacturer raises the invoice. */
  price: number;
  gst: number;
}

/* ---------------------------------------------------------------------------
 * Document compliance
 * ------------------------------------------------------------------------ */

export type DocKind =
  | "INVOICE"
  | "ALLOCATION"
  | "PRICE_CIRCULAR"
  | "EWAY_BILL"
  | "DELIVERY_CHALLAN"
  | "POD";

export const DOC_LABELS: Record<DocKind, string> = {
  INVOICE: "Tax invoice",
  ALLOCATION: "Allocation advice",
  PRICE_CIRCULAR: "Price circular",
  EWAY_BILL: "E-way bill",
  DELIVERY_CHALLAN: "Delivery challan",
  POD: "Proof of delivery",
};

/**
 * One document on the shared record. `issuedBy` is the party that raised it and
 * `sharedWith` is everyone it was distributed to — the plant's e-way bill, for
 * instance, reaches the manufacturer, the transporter and the dealer at the same
 * instant instead of being emailed to one of them.
 */
export interface ComplianceDoc {
  id: string;
  vin: string;
  kind: DocKind;
  reference: string;
  issuedBy: Role;
  sharedWith: Role[];
  issuedAt: string;
  fields: Record<string, string>;
}

export type Severity = "CRITICAL" | "WARNING";

export interface ComplianceFinding {
  id: string;
  vin: string;
  ruleId: string;
  rule: string;
  severity: Severity;
  message: string;
  field?: string;
  expected?: string;
  found?: string;
  /** The documents that disagree — what the reviewer has to open. */
  docs: DocKind[];
}


/* ---------------------------------------------------------------------------
 * Service levels
 * ------------------------------------------------------------------------ */

export type SlaOutcome = "MET" | "BREACHED" | "AT_RISK" | "RUNNING" | "NOT_STARTED";

/** A promised turnaround between two points in the goods or document flow. */
export interface SlaDefinition {
  id: string;
  label: string;
  /** What the clock is protecting, in one line. */
  intent: string;
  from: Stage;
  to: Stage;
  targetHours: number;
}

export interface SlaResult {
  slaId: string;
  vin: string;
  outcome: SlaOutcome;
  /** Hours actually taken, or elapsed so far when the leg is still running. */
  elapsedHours: number | null;
  targetHours: number;
}
