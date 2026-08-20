import { DEMO_NOW } from "./mockData";
import type { ComplianceDoc, ComplianceFinding, DocKind, Severity, Vehicle } from "./types";

export interface Rule {
  id: string;
  title: string;
  severity: Severity;
  /** What the rule is protecting against, in one line — shown in the report. */
  intent: string;
}

/**
 * The rulebook. Every rule compares fields *across* documents raised by
 * different parties — that cross-check is the whole point: no single party can
 * see the mismatch on its own copy.
 */
export const RULES: Rule[] = [
  {
    id: "R01",
    title: "Chassis on the e-way bill matches the invoice",
    severity: "CRITICAL",
    intent: "A transposed digit on the dispatch papers strands the car at the gate — or moves the wrong one.",
  },
  {
    id: "R02",
    title: "Chassis on the delivery challan matches the invoice",
    severity: "CRITICAL",
    intent: "The challan is what the dealer signs against; a wrong chassis breaks the delivery trail.",
  },
  {
    id: "R03",
    title: "Invoice priced off the circular active on the invoice date",
    severity: "CRITICAL",
    intent: "A superseded circular means the dealer is billed at the wrong ex-showroom price.",
  },
  {
    id: "R04",
    title: "Allocation variant and colour match the invoice",
    severity: "CRITICAL",
    intent: "The car built is not the car allocated — the mismatch surfaces at the gate, not in the yard.",
  },
  {
    id: "R05",
    title: "Delivery challan is raised against the invoiced dealer",
    severity: "CRITICAL",
    intent: "A wrong dealer code on the challan sends the car — and the liability — to the wrong yard.",
  },
  {
    id: "R06",
    title: "E-way bill is still valid on the dispatch date",
    severity: "CRITICAL",
    intent: "An expired e-way bill is a detained truck and a penalty, discovered at a state border.",
  },
  {
    id: "R07",
    title: "GST is 28% of the taxable value",
    severity: "WARNING",
    intent: "A tax total that does not reconcile is an input-credit problem for the dealer.",
  },
  {
    id: "R08",
    title: "E-way bill accompanies every gate-out",
    severity: "WARNING",
    intent: "A truck stopped without a valid e-way bill loses days at the state border.",
  },
  {
    id: "R09",
    title: "Invoice carries an IRN",
    severity: "WARNING",
    intent: "An invoice without an IRN has not been registered on the IRP.",
  },
  {
    id: "R10",
    title: "Delivered cars carry a proof of delivery",
    severity: "WARNING",
    intent: "Without a POD there is nothing closing the loop on the shipment.",
  },
];

const RULE_BY_ID = new Map(RULES.map((r) => [r.id, r]));

function docOf(docs: ComplianceDoc[], kind: DocKind): ComplianceDoc | undefined {
  return docs.find((d) => d.kind === kind);
}

function finding(
  vin: string,
  ruleId: string,
  message: string,
  docKinds: DocKind[],
  detail?: { field?: string; expected?: string; found?: string }
): ComplianceFinding {
  const rule = RULE_BY_ID.get(ruleId)!;
  return {
    id: `${vin}-${ruleId}`,
    vin,
    ruleId,
    rule: rule.title,
    severity: rule.severity,
    message,
    docs: docKinds,
    ...detail,
  };
}

/** The circular that should be in force on a given invoice date. */
function inr(value: string | number): string {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function expectedCircularFor(invoiceDate: string): string {
  return `PC-${invoiceDate.slice(0, 7)}-01`;
}

/**
 * Runs the rulebook over one vehicle's document set. Pure: same documents in,
 * same findings out — the report is reproducible on every load.
 */
export function validateVehicle(
  vehicle: Vehicle,
  docs: ComplianceDoc[],
  /**
   * The document kinds the caller is entitled to see. Absence rules ("no e-way
   * bill was attached") only fire for a party that would actually hold that
   * document — otherwise role scoping would masquerade as a compliance failure.
   */
  visibleKinds?: Set<DocKind>
): ComplianceFinding[] {
  const canSee = (kind: DocKind) => !visibleKinds || visibleKinds.has(kind);
  const out: ComplianceFinding[] = [];
  const invoice = docOf(docs, "INVOICE");
  const allocation = docOf(docs, "ALLOCATION");
  const challan = docOf(docs, "DELIVERY_CHALLAN");
  const eway = docOf(docs, "EWAY_BILL");
  const pod = docOf(docs, "POD");

  if (!invoice) return out;
  const inv = invoice.fields;

  if (eway && eway.fields.chassis && eway.fields.chassis !== inv.chassis) {
    out.push(
      finding(
        vehicle.vin,
        "R01",
        `The e-way bill was raised against chassis ${eway.fields.chassis}; the invoice is for ${inv.chassis}.`,
        ["EWAY_BILL", "INVOICE"],
        { field: "chassis", expected: inv.chassis, found: eway.fields.chassis }
      )
    );
  }

  if (challan && challan.fields.chassis && challan.fields.chassis !== inv.chassis) {
    out.push(
      finding(
        vehicle.vin,
        "R02",
        `The delivery challan names chassis ${challan.fields.chassis}; the invoice is for ${inv.chassis}.`,
        ["DELIVERY_CHALLAN", "INVOICE"],
        { field: "chassis", expected: inv.chassis, found: challan.fields.chassis }
      )
    );
  }

  if (eway?.fields.validTill && eway.fields.validTill < DEMO_NOW.slice(0, 10)) {
    out.push(
      finding(
        vehicle.vin,
        "R06",
        `The e-way bill lapsed on ${eway.fields.validTill} and the car has not left the plant.`,
        ["EWAY_BILL"],
        { field: "validTill", expected: `on or after ${DEMO_NOW.slice(0, 10)}`, found: eway.fields.validTill }
      )
    );
  }

  const expectedCircular = expectedCircularFor(inv.invoiceDate);
  if (inv.priceCircularRef !== expectedCircular) {
    out.push(
      finding(
        vehicle.vin,
        "R03",
        `Invoice dated ${inv.invoiceDate} was priced off ${inv.priceCircularRef}; ${expectedCircular} was in force.`,
        ["INVOICE", "PRICE_CIRCULAR"],
        { field: "priceCircularRef", expected: expectedCircular, found: inv.priceCircularRef }
      )
    );
  }

  if (allocation) {
    const al = allocation.fields;
    if (al.variant !== inv.variant || al.colour !== inv.colour) {
      out.push(
        finding(
          vehicle.vin,
          "R04",
          `Allocation is for ${al.variant} ${al.colour}; the invoice was raised for ${inv.variant} ${inv.colour}.`,
          ["ALLOCATION", "INVOICE"],
          {
            field: "variant / colour",
            expected: `${al.variant} · ${al.colour}`,
            found: `${inv.variant} · ${inv.colour}`,
          }
        )
      );
    }
  }

  if (challan && challan.fields.dealerCode !== inv.dealerCode) {
    out.push(
      finding(
        vehicle.vin,
        "R05",
        `Delivery challan names dealer ${challan.fields.dealerCode}; the invoice is billed to ${inv.dealerCode}.`,
        ["DELIVERY_CHALLAN", "INVOICE"],
        { field: "dealerCode", expected: inv.dealerCode, found: challan.fields.dealerCode }
      )
    );
  }

  const hasLeftPlant = Boolean(vehicle.stageTimestamps.GATE_OUT);

  const expectedGst = Math.round(Number(inv.amount) * 0.28);
  if (Math.abs(expectedGst - Number(inv.gst)) > Number(inv.amount) * 0.01) {
    out.push(
      finding(
        vehicle.vin,
        "R07",
        "GST on the invoice does not reconcile to 28% of the taxable value.",
        ["INVOICE"],
        { field: "gst", expected: inr(expectedGst), found: inr(inv.gst) }
      )
    );
  }

  if (hasLeftPlant && !eway && canSee("EWAY_BILL")) {
    out.push(
      finding(vehicle.vin, "R08", "Gate-out is recorded but no e-way bill was ever attached.", [
        "DELIVERY_CHALLAN",
      ])
    );
  }

  if (!inv.irn) {
    out.push(
      finding(vehicle.vin, "R09", "The invoice carries no IRN — it was never registered on the IRP.", [
        "INVOICE",
      ], { field: "irn", expected: "32-character IRN", found: "—" })
    );
  }

  if (vehicle.stage === "DELIVERED" && !pod && canSee("POD")) {
    out.push(
      finding(vehicle.vin, "R10", "The car is marked delivered with no proof of delivery on file.", [
        "DELIVERY_CHALLAN",
      ])
    );
  }

  return out;
}

export function groupDocsByVin(docs: ComplianceDoc[]): Map<string, ComplianceDoc[]> {
  const map = new Map<string, ComplianceDoc[]>();
  for (const doc of docs) {
    map.set(doc.vin, [...(map.get(doc.vin) ?? []), doc]);
  }
  return map;
}

/** Every finding across a (already role-scoped) vehicle list, criticals first. */
export function validateAll(
  vehicles: Vehicle[],
  docs: ComplianceDoc[],
  visibleKinds?: Set<DocKind>
): ComplianceFinding[] {
  const byVin = groupDocsByVin(docs);
  return vehicles
    .flatMap((v) => validateVehicle(v, byVin.get(v.vin) ?? [], visibleKinds))
    .sort((a, b) => (a.severity === b.severity ? a.vin.localeCompare(b.vin) : a.severity === "CRITICAL" ? -1 : 1));
}

export interface ComplianceReport {
  asOf: string;
  vehiclesChecked: number;
  docsChecked: number;
  rulesRun: number;
  clean: number;
  withCritical: number;
  withWarningOnly: number;
  /** 0–100, share of checked cars with no open finding. */
  complianceRate: number;
  byRule: { rule: Rule; count: number; vins: string[] }[];
  byDealer: { dealerCode: string; dealerName: string; checked: number; critical: number; warning: number }[];
  findings: ComplianceFinding[];
}

/** The end-of-run report: one number for the panel, then the breakdown behind it. */
export function buildComplianceReport(
  vehicles: Vehicle[],
  docs: ComplianceDoc[],
  visibleKinds?: Set<DocKind>
): ComplianceReport {
  const findings = validateAll(vehicles, docs, visibleKinds);
  const byVin = new Map<string, ComplianceFinding[]>();
  for (const f of findings) byVin.set(f.vin, [...(byVin.get(f.vin) ?? []), f]);

  const withCritical = vehicles.filter((v) =>
    (byVin.get(v.vin) ?? []).some((f) => f.severity === "CRITICAL")
  ).length;
  const withWarningOnly = vehicles.filter((v) => {
    const fs = byVin.get(v.vin) ?? [];
    return fs.length > 0 && fs.every((f) => f.severity === "WARNING");
  }).length;
  const clean = vehicles.length - withCritical - withWarningOnly;

  const byDealerMap = new Map<
    string,
    { dealerName: string; checked: number; critical: number; warning: number }
  >();
  for (const v of vehicles) {
    const entry = byDealerMap.get(v.dealerCode) ?? {
      dealerName: v.dealerName,
      checked: 0,
      critical: 0,
      warning: 0,
    };
    entry.checked += 1;
    for (const f of byVin.get(v.vin) ?? []) {
      if (f.severity === "CRITICAL") entry.critical += 1;
      else entry.warning += 1;
    }
    byDealerMap.set(v.dealerCode, entry);
  }

  const scopedVins = new Set(vehicles.map((v) => v.vin));

  return {
    asOf: DEMO_NOW,
    vehiclesChecked: vehicles.length,
    docsChecked: docs.filter((d) => scopedVins.has(d.vin)).length,
    rulesRun: RULES.length,
    clean,
    withCritical,
    withWarningOnly,
    complianceRate: vehicles.length === 0 ? 100 : Math.round((clean / vehicles.length) * 100),
    byRule: RULES.map((rule) => {
      const hits = findings.filter((f) => f.ruleId === rule.id);
      return { rule, count: hits.length, vins: hits.map((f) => f.vin) };
    }).filter((r) => r.count > 0),
    byDealer: Array.from(byDealerMap.entries()).map(([dealerCode, rest]) => ({
      dealerCode,
      ...rest,
    })),
    findings,
  };
}
