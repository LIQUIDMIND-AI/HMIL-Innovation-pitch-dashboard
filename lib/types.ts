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
