import type {
  AvailabilityRecord,
  ComplianceDoc,
  DocKind,
  Order,
  Role,
  Trip,
  Vehicle,
} from "./types";

/**
 * Fixed reference instant for the whole demo. All "age" / SLA-breach timers
 * are computed against this constant, never against the real system clock,
 * so the demo renders identically on every load and on any date.
 */
export const DEMO_NOW = "2026-08-19T15:00:00+05:30";

export const REGION_NORTH = "North — Chandigarh RO";

export const DEALERS = {
  KRISHNA: {
    dealerCode: "KRD-CHD-014",
    dealerName: "Krishna Hyundai",
    region: REGION_NORTH,
  },
  METRO: {
    dealerCode: "MHL-LDH-027",
    dealerName: "Metro Hyundai",
    region: REGION_NORTH,
  },
} as const;

const LSP_SPEEDLINE = "Speedline Logistics";

export const VEHICLES: Vehicle[] = [

  // ---- 5 fully CLEAR, various stages (happy path) ----
  {
    vin: "MALBB51RLSM104001",
    chassisShort: "4001",
    model: "Creta",
    variant: "SX(O)",
    colour: "Titan Grey",
    ...DEALERS.KRISHNA,
    invoice: {
      number: "HMIL-INV-2026-08-1041",
      date: "2026-08-02",
      amount: 1570000,
      gst: 440000,
      irn: "9f3a1c7b2e4d5f6a8b9c0d1e2f3a4b5c",
    },
    allocationRef: "ALC-CHD-2026-0801",
    priceCircularRef: "PC-2026-08-01",
    dispatch: {
      status: "RAISED",
      ewbNo: "EWB-4001-8841",
      challanNo: "DC-4001-2026",
      chassisOnDocs: "4001",
      validTill: "2026-08-25",
      raisedAt: "2026-08-04T06:00:00+05:30",
    },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "CLEAR",
    },
    overall: "CLEAR",
    stage: "DELIVERED",
    stageTimestamps: {
      INVOICED: "2026-08-02T09:15:00+05:30",
      ALLOCATION_MATCHED: "2026-08-02T09:25:00+05:30",
      DOCS_VERIFIED: "2026-08-03T11:20:00+05:30",
      DISPATCH_READY: "2026-08-04T06:00:00+05:30",
      GATE_OUT: "2026-08-04T08:00:00+05:30",
      IN_TRANSIT: "2026-08-04T09:00:00+05:30",
      DELIVERED: "2026-08-08T16:40:00+05:30",
    },
    lsp: {
      name: LSP_SPEEDLINE,
      truckNo: "PB-11-AT-4471",
      route: "Sriperumbudur (TN) → Chandigarh (PB)",
      etaDays: 4,
      lastMilestone:
        "Delivered to dealer",
    },
    notes: [],
  },
  {
    vin: "MALBB51RLSM104002",
    chassisShort: "4002",
    model: "Venue",
    variant: "S",
    colour: "Atlas White",
    ...DEALERS.METRO,
    invoice: {
      number: "HMIL-INV-2026-08-1052",
      date: "2026-08-01",
      amount: 725000,
      gst: 205000,
      irn: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d",
    },
    allocationRef: "ALC-LDH-2026-0512",
    priceCircularRef: "PC-2026-08-01",
    dispatch: {
      status: "RAISED",
      ewbNo: "EWB-4002-8841",
      challanNo: "DC-4002-2026",
      chassisOnDocs: "4002",
      validTill: "2026-08-25",
      raisedAt: "2026-08-03T06:30:00+05:30",
    },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "CLEAR",
    },
    overall: "CLEAR",
    stage: "DELIVERED",
    stageTimestamps: {
      INVOICED: "2026-08-01T09:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-01T09:10:00+05:30",
      DOCS_VERIFIED: "2026-08-02T10:05:00+05:30",
      DISPATCH_READY: "2026-08-03T06:30:00+05:30",
      GATE_OUT: "2026-08-03T08:30:00+05:30",
      IN_TRANSIT: "2026-08-03T09:30:00+05:30",
      DELIVERED: "2026-08-07T14:10:00+05:30",
    },
    lsp: {
      name: LSP_SPEEDLINE,
      truckNo: "PB-65-BT-2210",
      route: "Sriperumbudur (TN) → Ludhiana (PB)",
      etaDays: 4,
      lastMilestone:
        "Delivered to dealer",
    },
    notes: [],
  },
  {
    vin: "MALBB51RLSM104003",
    chassisShort: "4003",
    model: "i20",
    variant: "SX",
    colour: "Fiery Red",
    ...DEALERS.KRISHNA,
    invoice: {
      number: "HMIL-INV-2026-08-1063",
      date: "2026-08-15",
      amount: 980000,
      gst: 275000,
      irn: "2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
    },
    allocationRef: "ALC-CHD-2026-0842",
    priceCircularRef: "PC-2026-08-01",
    dispatch: {
      status: "RAISED",
      ewbNo: "EWB-4003-8841",
      challanNo: "DC-4003-2026",
      chassisOnDocs: "4003",
      validTill: "2026-08-25",
      raisedAt: "2026-08-17T06:10:00+05:30",
    },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "CLEAR",
    },
    overall: "CLEAR",
    stage: "IN_TRANSIT",
    stageTimestamps: {
      INVOICED: "2026-08-15T09:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-15T09:10:00+05:30",
      DOCS_VERIFIED: "2026-08-16T12:00:00+05:30",
      DISPATCH_READY: "2026-08-17T06:10:00+05:30",
      GATE_OUT: "2026-08-17T08:10:00+05:30",
      IN_TRANSIT: "2026-08-17T09:10:00+05:30",
    },
    lsp: {
      name: LSP_SPEEDLINE,
      truckNo: "PB-11-AT-5590",
      route: "Sriperumbudur (TN) → Chandigarh (PB)",
      etaDays: 4,
      lastMilestone:
        "In transit — crossed Nagpur checkpoint, on schedule",
    },
    notes: [],
  },
  {
    vin: "MALBB51RLSM104004",
    chassisShort: "4004",
    model: "Exter",
    variant: "S",
    colour: "Typhoon Silver",
    ...DEALERS.KRISHNA,
    invoice: {
      number: "HMIL-INV-2026-08-1074",
      date: "2026-08-16",
      amount: 760000,
      gst: 215000,
      irn: "3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f",
    },
    allocationRef: "ALC-CHD-2026-0855",
    priceCircularRef: "PC-2026-08-01",
    dispatch: {
      status: "RAISED",
      ewbNo: "EWB-4004-8841",
      challanNo: "DC-4004-2026",
      chassisOnDocs: "4004",
      validTill: "2026-08-25",
      raisedAt: "2026-08-18T06:00:00+05:30",
    },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "CLEAR",
    },
    overall: "CLEAR",
    stage: "GATE_OUT",
    stageTimestamps: {
      INVOICED: "2026-08-16T09:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-16T09:10:00+05:30",
      DOCS_VERIFIED: "2026-08-17T11:00:00+05:30",
      DISPATCH_READY: "2026-08-18T06:00:00+05:30",
      GATE_OUT: "2026-08-18T08:00:00+05:30",
    },
    lsp: {
      name: LSP_SPEEDLINE,
      truckNo: "PB-11-AT-6634",
      route: "Sriperumbudur (TN) → Chandigarh (PB)",
      etaDays: 4,
      lastMilestone:
        "Awaiting pickup at plant yard",
    },
    notes: [],
  },
  {
    vin: "MALBB51RLSM104005",
    chassisShort: "4005",
    model: "Verna",
    variant: "SX",
    colour: "Abyss Black Pearl",
    ...DEALERS.METRO,
    invoice: {
      number: "HMIL-INV-2026-08-1085",
      date: "2026-08-17",
      amount: 1150000,
      gst: 325000,
      irn: "4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    },
    allocationRef: "ALC-LDH-2026-0523",
    priceCircularRef: "PC-2026-08-01",
    dispatch: {
      status: "RAISED",
      ewbNo: "EWB-4005-8841",
      challanNo: "DC-4005-2026",
      chassisOnDocs: "4005",
      validTill: "2026-08-25",
      raisedAt: "2026-08-19T09:00:00+05:30",
    },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "CLEAR",
    },
    overall: "CLEAR",
    stage: "DISPATCH_READY",
    stageTimestamps: {
      INVOICED: "2026-08-17T09:30:00+05:30",
      ALLOCATION_MATCHED: "2026-08-17T09:40:00+05:30",
      DOCS_VERIFIED: "2026-08-18T15:30:00+05:30",
      DISPATCH_READY: "2026-08-19T09:00:00+05:30",
    },
    notes: [],
  },

  // ---- 2 waiting on document verification, still inside SLA ----
  {
    vin: "MALBB51RLSM104006",
    chassisShort: "4006",
    model: "Creta",
    variant: "SX",
    colour: "Titan Grey",
    ...DEALERS.KRISHNA,
    invoice: {
      number: "HMIL-INV-2026-08-1096",
      date: "2026-08-19",
      amount: 1480000,
      gst: 415000,
      irn: "5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    },
    allocationRef: "ALC-CHD-2026-0871",
    priceCircularRef: "PC-2026-08-01",
    dispatch: { status: "NOT_RAISED" },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "PENDING",
    },
    overall: "CLEAR",
    stage: "ALLOCATION_MATCHED",
    stageTimestamps: {
      INVOICED: "2026-08-19T09:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-19T09:10:00+05:30",
    },
    notes: [],
  },
  {
    vin: "MALBB51RLSM104007",
    chassisShort: "4007",
    model: "Venue",
    variant: "E",
    colour: "Atlas White",
    ...DEALERS.METRO,
    invoice: {
      number: "HMIL-INV-2026-08-1107",
      date: "2026-08-18",
      amount: 680000,
      gst: 190000,
      irn: "6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
    },
    allocationRef: "ALC-LDH-2026-0534",
    priceCircularRef: "PC-2026-08-01",
    dispatch: { status: "NOT_RAISED" },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "PENDING",
    },
    overall: "CLEAR",
    stage: "ALLOCATION_MATCHED",
    stageTimestamps: {
      INVOICED: "2026-08-18T16:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-18T16:10:00+05:30",
    },
    notes: [],
  },

  // ---- 1 dispatch-document mismatch — THE hero stuck car ----
  {
    vin: "MALBB51RLSM104921",
    chassisShort: "4921",
    model: "Creta",
    variant: "SX(O)",
    colour: "Titan Grey",
    ...DEALERS.KRISHNA,
    invoice: {
      number: "HMIL-INV-2026-08-1042",
      date: "2026-08-11",
      amount: 1570000,
      gst: 440000,
      irn: "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    },
    allocationRef: "ALC-CHD-2026-0844",
    priceCircularRef: "PC-2026-08-01",
    dispatch: {
      status: "MISMATCH",
      ewbNo: "EWB-4912-8841",
      challanNo: "DC-4912-2026",
      chassisOnDocs: "4912",
      validTill: "2026-08-22",
      raisedAt: "2026-08-15T10:05:00+05:30",
    },
    checks: {
      chassisMatch: "MISMATCH",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "MISMATCH",
    },
    overall: "STUCK",
    stuckReason:
      "Dispatch papers were raised against chassis 4912; the invoice is for 4921 — the gate pass stays blocked until the e-way bill and the invoice agree.",
    stage: "ALLOCATION_MATCHED",
    stageTimestamps: {
      INVOICED: "2026-08-11T09:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-11T09:10:00+05:30",
    },
    notes: [
      {
        author: "Rakesh Mehta",
        role: "ro",
        text:
          "Flagged to the Sriperumbudur dispatch desk — cancel the e-way bill raised on 4912 and re-raise it against 4921 before the truck is loaded.",
        at: "2026-08-16T11:05:00+05:30",
      },
    ],
  },

  // ---- 1 price-circular mismatch ----
  {
    vin: "MALBB51RLSM104009",
    chassisShort: "4009",
    model: "i20",
    variant: "SX(O)",
    colour: "Fiery Red",
    ...DEALERS.KRISHNA,
    invoice: {
      number: "HMIL-INV-2026-08-1113",
      date: "2026-08-14",
      amount: 1120000,
      gst: 315000,
      irn: "8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    },
    allocationRef: "ALC-CHD-2026-0849",
    priceCircularRef: "PC-2026-07-01",
    dispatch: { status: "NOT_RAISED" },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "MISMATCH",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "PENDING",
    },
    overall: "STUCK",
    stuckReason:
      "Invoice priced off the July circular (PC-2026-07-01); the August circular (PC-2026-08-01) is the one active on the invoice date — price mismatch to resolve before dispatch papers can be raised.",
    stage: "ALLOCATION_MATCHED",
    stageTimestamps: {
      INVOICED: "2026-08-14T09:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-14T09:10:00+05:30",
    },
    notes: [],
  },

  // ---- 1 allocation variant mismatch ----
  {
    vin: "MALBB51RLSM104010",
    chassisShort: "4010",
    model: "Venue",
    variant: "SX(O)",
    colour: "Atlas White",
    ...DEALERS.METRO,
    invoice: {
      number: "HMIL-INV-2026-08-1124",
      date: "2026-08-13",
      amount: 950000,
      gst: 268000,
      irn: "9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
    },
    allocationRef: "ALC-LDH-2026-0541",
    priceCircularRef: "PC-2026-08-01",
    dispatch: { status: "NOT_RAISED" },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "MISMATCH",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "PENDING",
    },
    overall: "STUCK",
    stuckReason:
      "Allocation was issued for variant SX; the invoice was raised for SX(O) — variant mismatch to resolve before dispatch papers can be raised.",
    stage: "ALLOCATION_MATCHED",
    stageTimestamps: {
      INVOICED: "2026-08-13T09:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-13T09:10:00+05:30",
    },
    notes: [],
  },

  // ---- 1 document-verification SLA breach ----
  {
    vin: "MALBB51RLSM104011",
    chassisShort: "4011",
    model: "Exter",
    variant: "SX",
    colour: "Typhoon Silver",
    ...DEALERS.KRISHNA,
    invoice: {
      number: "HMIL-INV-2026-08-1135",
      date: "2026-08-16",
      amount: 890000,
      gst: 250000,
      irn: "0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    },
    allocationRef: "ALC-CHD-2026-0862",
    priceCircularRef: "PC-2026-08-01",
    dispatch: { status: "NOT_RAISED" },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "PENDING",
    },
    overall: "STUCK",
    stuckReason:
      "Document verification has been open 76h — past the 48h check-and-clear SLA, so no dispatch paperwork has been raised yet.",
    stage: "ALLOCATION_MATCHED",
    stageTimestamps: {
      INVOICED: "2026-08-16T10:50:00+05:30",
      ALLOCATION_MATCHED: "2026-08-16T11:00:00+05:30",
    },
    notes: [
      {
        author: "Priya Nair",
        role: "ro",
        text:
          "Escalated to HQ — this car is well past the 24h document-verification SLA; please push the dispatch desk to clear the checks today.",
        at: "2026-08-19T09:30:00+05:30",
      },
    ],
  },

  // ---- 1 damaged unit awaiting substitution ----
  {
    vin: "MALBB51RLSM104012",
    chassisShort: "4012",
    model: "Verna",
    variant: "S",
    colour: "Abyss Black Pearl",
    ...DEALERS.KRISHNA,
    invoice: {
      number: "HMIL-INV-2026-08-1146",
      date: "2026-08-17",
      amount: 1080000,
      gst: 305000,
      irn: "1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    },
    allocationRef: "ALC-CHD-2026-0868",
    priceCircularRef: "PC-2026-08-01",
    dispatch: { status: "NOT_RAISED" },
    checks: {
      chassisMatch: "PENDING",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "PENDING",
    },
    overall: "STUCK",
    stuckReason:
      "Original chassis 4012 was damaged during plant loading. A substitute VIN allocation is in progress with the RO — the invoice will be re-raised against the substitute unit.",
    stage: "ALLOCATION_MATCHED",
    stageTimestamps: {
      INVOICED: "2026-08-17T08:50:00+05:30",
      ALLOCATION_MATCHED: "2026-08-17T09:00:00+05:30",
    },
    notes: [
      {
        author: "Suresh Iyer",
        role: "plant",
        text:
          "Damage noted during forklift loading at Sriperumbudur yard. Substitution request raised with RO for a like-for-like unit.",
        at: "2026-08-17T13:45:00+05:30",
      },
    ],
  },

  // ---- 2 in transit, one of them running late ----
  {
    vin: "MALBB51RLSM104013",
    chassisShort: "4013",
    model: "Creta",
    variant: "E",
    colour: "Fiery Red",
    ...DEALERS.KRISHNA,
    invoice: {
      number: "HMIL-INV-2026-08-1157",
      date: "2026-08-15",
      amount: 1240000,
      gst: 348000,
      irn: "2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c",
    },
    allocationRef: "ALC-CHD-2026-0839",
    priceCircularRef: "PC-2026-08-01",
    dispatch: {
      status: "RAISED",
      ewbNo: "EWB-4013-8841",
      challanNo: "DC-4013-2026",
      chassisOnDocs: "4013",
      validTill: "2026-08-25",
      raisedAt: "2026-08-17T06:10:00+05:30",
    },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "CLEAR",
    },
    overall: "CLEAR",
    stage: "IN_TRANSIT",
    stageTimestamps: {
      INVOICED: "2026-08-15T10:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-15T10:10:00+05:30",
      DOCS_VERIFIED: "2026-08-16T13:00:00+05:30",
      DISPATCH_READY: "2026-08-17T06:10:00+05:30",
      GATE_OUT: "2026-08-17T08:10:00+05:30",
      IN_TRANSIT: "2026-08-17T09:10:00+05:30",
    },
    lsp: {
      name: LSP_SPEEDLINE,
      truckNo: "PB-11-AT-7712",
      route: "Sriperumbudur (TN) → Chandigarh (PB)",
      etaDays: 4,
      lastMilestone:
        "In transit — on schedule, ETA in 1 day",
    },
    notes: [],
  },
  {
    vin: "MALBB51RLSM104014",
    chassisShort: "4014",
    model: "i20",
    variant: "E",
    colour: "Typhoon Silver",
    ...DEALERS.METRO,
    invoice: {
      number: "HMIL-INV-2026-08-1168",
      date: "2026-08-12",
      amount: 850000,
      gst: 238000,
      irn: "3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
    },
    allocationRef: "ALC-LDH-2026-0505",
    priceCircularRef: "PC-2026-08-01",
    dispatch: {
      status: "RAISED",
      ewbNo: "EWB-4014-8841",
      challanNo: "DC-4014-2026",
      chassisOnDocs: "4014",
      validTill: "2026-08-25",
      raisedAt: "2026-08-14T05:45:00+05:30",
    },
    checks: {
      chassisMatch: "CLEAR",
      variantColourMatch: "CLEAR",
      priceMatch: "CLEAR",
      taxTotalsMatch: "CLEAR",
      dispatchDocsPresent: "CLEAR",
    },
    overall: "CLEAR",
    stage: "IN_TRANSIT",
    stageTimestamps: {
      INVOICED: "2026-08-12T09:00:00+05:30",
      ALLOCATION_MATCHED: "2026-08-12T09:10:00+05:30",
      DOCS_VERIFIED: "2026-08-13T10:00:00+05:30",
      DISPATCH_READY: "2026-08-14T05:45:00+05:30",
      GATE_OUT: "2026-08-14T07:45:00+05:30",
      IN_TRANSIT: "2026-08-14T08:45:00+05:30",
    },
    lsp: {
      name: LSP_SPEEDLINE,
      truckNo: "PB-65-BT-3381",
      route: "Sriperumbudur (TN) → Ludhiana (PB)",
      etaDays: 4,
      lastMilestone:
        "Delayed — held at Nagpur checkpoint for inspection, +2 days vs ETA",
    },
    notes: [],
  },
];

/**
 * Two seeded trips for the tracking screen. Routes are the real NH-44 corridor
 * as [lat, lng] waypoints, drawn over OpenStreetMap tiles; the truck marker
 * interpolates along them. One trip runs to promise, one is two days late.
 */
const NH44_SOUTH: [number, number][] = [
  [12.9675, 79.943],
  [13.63, 79.42],
  [14.47, 78.82],
  [15.83, 78.04],
  [17.385, 78.487],
  [18.67, 78.09],
  [19.67, 78.53],
  [21.146, 79.088],
];

const NH44_NORTH: [number, number][] = [
  [23.18, 79.95],
  [25.45, 78.57],
  [27.18, 78.01],
  [28.61, 77.21],
];

const ROUTE_CHANDIGARH: [number, number][] = [
  ...NH44_SOUTH,
  ...NH44_NORTH,
  [29.69, 76.99],
  [30.733, 76.779],
];

const ROUTE_LUDHIANA: [number, number][] = [
  ...NH44_SOUTH,
  ...NH44_NORTH,
  [29.39, 76.97],
  [30.9, 75.857],
];

export const TRIPS: Trip[] = [
  {
    id: "TRP-CHD-2026-0118",
    carrier: LSP_SPEEDLINE,
    truckNo: "PB-11-AT-5590",
    origin: "Sriperumbudur (TN)",
    destination: "Chandigarh (PB)",
    vins: ["MALBB51RLSM104003", "MALBB51RLSM104013"],
    promiseDate: "2026-08-21",
    etaDate: "2026-08-21",
    status: "ON_TIME",
    daysLate: 0,
    progress: 0.62,
    route: ROUTE_CHANDIGARH,
    milestones: [
      {
        label: "Gate-out, Sriperumbudur",
        at: "2026-08-17T08:10:00+05:30",
        reached: true,
        t: 0,
        lat: 12.9675,
        lng: 79.943,
      },
      {
        label: "Hub — Nagpur",
        at: "2026-08-18T21:35:00+05:30",
        reached: true,
        t: 0.45,
        lat: 21.146,
        lng: 79.088,
      },
      { label: "Hub — Delhi", reached: false, t: 0.87, lat: 28.61, lng: 77.21 },
      {
        label: "Dealer yard, Chandigarh",
        reached: false,
        t: 1,
        lat: 30.733,
        lng: 76.779,
      },
    ],
  },
  {
    id: "TRP-LDH-2026-0204",
    carrier: LSP_SPEEDLINE,
    truckNo: "PB-65-BT-3381",
    origin: "Sriperumbudur (TN)",
    destination: "Ludhiana (PB)",
    vins: ["MALBB51RLSM104014"],
    promiseDate: "2026-08-20",
    etaDate: "2026-08-22",
    status: "DELAYED",
    daysLate: 2,
    progress: 0.45,
    route: ROUTE_LUDHIANA,
    milestones: [
      {
        label: "Gate-out, Sriperumbudur",
        at: "2026-08-14T07:45:00+05:30",
        reached: true,
        t: 0,
        lat: 12.9675,
        lng: 79.943,
      },
      {
        label: "Hub — Nagpur (held for inspection)",
        at: "2026-08-18T13:20:00+05:30",
        reached: true,
        t: 0.45,
        lat: 21.146,
        lng: 79.088,
      },
      { label: "Hub — Delhi", reached: false, t: 0.87, lat: 28.61, lng: 77.21 },
      { label: "Dealer yard, Ludhiana", reached: false, t: 1, lat: 30.9, lng: 75.857 },
    ],
  },
];

/* ---------------------------------------------------------------------------
 * ERP seed — what the plant can ship today and what it can build
 * ------------------------------------------------------------------------ */

/** Deliberately mixed: lines with stock, lines with none, and a long-lead line. */
export const AVAILABILITY: AvailabilityRecord[] = [
  {
    model: "Creta",
    variant: "SX(O)",
    colours: ["Titan Grey", "Atlas White", "Fiery Red"],
    readyToTransport: 3,
    buildSlotDays: 12,
    buildSlotCapacity: 40,
    price: 1570000,
    gst: 440000,
  },
  {
    model: "Creta",
    variant: "SX",
    colours: ["Titan Grey", "Atlas White"],
    readyToTransport: 0,
    buildSlotDays: 9,
    buildSlotCapacity: 25,
    price: 1480000,
    gst: 415000,
  },
  {
    model: "Creta",
    variant: "E",
    colours: ["Atlas White", "Titan Grey"],
    readyToTransport: 5,
    buildSlotDays: 8,
    buildSlotCapacity: 30,
    price: 1240000,
    gst: 348000,
  },
  {
    model: "Venue",
    variant: "S",
    colours: ["Atlas White", "Titan Grey"],
    readyToTransport: 6,
    buildSlotDays: 7,
    buildSlotCapacity: 30,
    price: 725000,
    gst: 205000,
  },
  {
    model: "i20",
    variant: "SX",
    colours: ["Fiery Red", "Atlas White"],
    readyToTransport: 2,
    buildSlotDays: 10,
    buildSlotCapacity: 20,
    price: 980000,
    gst: 275000,
  },
  {
    model: "Exter",
    variant: "S",
    colours: ["Atlas White", "Ranger Khaki"],
    readyToTransport: 4,
    buildSlotDays: 6,
    buildSlotCapacity: 35,
    price: 760000,
    gst: 215000,
  },
  {
    model: "Verna",
    variant: "SX",
    colours: ["Titan Grey", "Fiery Red"],
    readyToTransport: 0,
    buildSlotDays: 21,
    buildSlotCapacity: 8,
    price: 1690000,
    gst: 475000,
  },
];

/** Seeded orders covering every state the ERP screens have to render. */
export const ORDERS: Order[] = [
  {
    id: "ORD-KRD-2026-0311",
    ...DEALERS.KRISHNA,
    model: "Creta",
    variant: "SX(O)",
    colour: "Titan Grey",
    qty: 2,
    reference: "Diwali retail block — top-up",
    requestedDelivery: "2026-09-05",
    placedBy: "Rajesh Bansal",
    placedAt: "2026-08-18T10:20:00+05:30",
    status: "SUBMITTED",
    invoicedVins: [],
  },
  {
    id: "ORD-KRD-2026-0312",
    ...DEALERS.KRISHNA,
    model: "Verna",
    variant: "SX",
    colour: "Fiery Red",
    qty: 3,
    reference: "Corporate fleet enquiry",
    requestedDelivery: "2026-08-29",
    placedBy: "Rajesh Bansal",
    placedAt: "2026-08-19T09:05:00+05:30",
    status: "SUBMITTED",
    invoicedVins: [],
  },
  {
    id: "ORD-KRD-2026-0309",
    ...DEALERS.KRISHNA,
    model: "Venue",
    variant: "S",
    colour: "Atlas White",
    qty: 4,
    reference: "Festive display stock",
    requestedDelivery: "2026-08-28",
    placedBy: "Rajesh Bansal",
    placedAt: "2026-08-14T15:40:00+05:30",
    status: "VERIFIED",
    plan: {
      verdict: "FROM_STOCK",
      fromStock: 4,
      toManufacture: 0,
      transportBy: "2026-08-22",
      promisedDelivery: "2026-08-26",
    },
    verifiedBy: "Ananya Sharma",
    verifiedAt: "2026-08-15T11:15:00+05:30",
    invoicedVins: [],
  },
  {
    id: "ORD-MHL-2026-0288",
    ...DEALERS.METRO,
    model: "i20",
    variant: "SX",
    colour: "Fiery Red",
    qty: 3,
    reference: "Ludhiana retail plan",
    requestedDelivery: "2026-09-10",
    placedBy: "Simran Kaur",
    placedAt: "2026-08-12T12:00:00+05:30",
    status: "VERIFIED",
    plan: {
      verdict: "PART_STOCK",
      fromStock: 2,
      toManufacture: 1,
      manufactureBy: "2026-08-31",
      transportBy: "2026-09-01",
      promisedDelivery: "2026-09-05",
    },
    verifiedBy: "Ananya Sharma",
    verifiedAt: "2026-08-13T10:05:00+05:30",
    invoicedVins: [],
  },
  {
    id: "ORD-KRD-2026-0305",
    ...DEALERS.KRISHNA,
    model: "Exter",
    variant: "S",
    colour: "Atlas White",
    qty: 1,
    reference: "Walk-in booking",
    requestedDelivery: "2026-08-20",
    placedBy: "Rajesh Bansal",
    placedAt: "2026-08-06T09:30:00+05:30",
    status: "INVOICED",
    plan: {
      verdict: "FROM_STOCK",
      fromStock: 1,
      toManufacture: 0,
      transportBy: "2026-08-13",
      promisedDelivery: "2026-08-17",
    },
    verifiedBy: "Ananya Sharma",
    verifiedAt: "2026-08-07T09:45:00+05:30",
    invoicedVins: ["MALBB51RLSM104004"],
  },
  {
    id: "ORD-MHL-2026-0301",
    ...DEALERS.METRO,
    model: "Tucson",
    variant: "Platinum",
    colour: "Titan Grey",
    qty: 2,
    reference: "Premium enquiry",
    requestedDelivery: "2026-09-01",
    placedBy: "Simran Kaur",
    placedAt: "2026-08-16T16:10:00+05:30",
    status: "REJECTED",
    plan: {
      verdict: "CONSTRAINED",
      fromStock: 0,
      toManufacture: 0,
      transportBy: "—",
      promisedDelivery: "—",
      constraint: "Tucson Platinum is not on the Chandigarh RO allocation plan for this quarter.",
    },
    verifiedBy: "Ananya Sharma",
    verifiedAt: "2026-08-17T10:30:00+05:30",
    rejectionReason:
      "Tucson Platinum is not on the Chandigarh RO allocation plan for this quarter — raise via the RO for a plan amendment.",
    invoicedVins: [],
  },
];

/* ---------------------------------------------------------------------------
 * Document seed
 * ------------------------------------------------------------------------ */

const DOC_SHARING: Record<DocKind, { issuedBy: Role; sharedWith: Role[] }> = {
  INVOICE: { issuedBy: "hq", sharedWith: ["plant", "ro", "dealer"] },
  ALLOCATION: { issuedBy: "hq", sharedWith: ["plant", "ro", "dealer"] },
  PRICE_CIRCULAR: { issuedBy: "hq", sharedWith: ["plant", "ro", "dealer"] },
  // The plant raises the dispatch papers once; the manufacturer, the RO, the
  // transporter and the dealer all read the same copy.
  EWAY_BILL: { issuedBy: "plant", sharedWith: ["hq", "ro", "lsp", "dealer"] },
  DELIVERY_CHALLAN: { issuedBy: "plant", sharedWith: ["hq", "ro", "lsp", "dealer"] },
  POD: { issuedBy: "lsp", sharedWith: ["hq", "ro", "dealer"] },
};

/** The document kinds a role is entitled to see at all — used so "missing document" rules only fire for parties that would actually hold it. */
export function docKindsVisibleTo(role: Role): Set<DocKind> {
  return new Set(
    (Object.keys(DOC_SHARING) as DocKind[]).filter(
      (kind) => DOC_SHARING[kind].issuedBy === role || DOC_SHARING[kind].sharedWith.includes(role)
    )
  );
}

export function makeDoc(
  vin: string,
  kind: DocKind,
  reference: string,
  issuedAt: string,
  fields: Record<string, string>
): ComplianceDoc {
  return {
    id: `${vin}-${kind}`,
    vin,
    kind,
    reference,
    issuedAt,
    fields,
    ...DOC_SHARING[kind],
  };
}

/**
 * Document-level defects seeded on otherwise-clean cars. They exist so the
 * compliance engine has something to catch that the five stuck cars don't
 * already show — a wrong dealer code on a challan, a missing e-way bill, an
 * unfilled IRN, a lapsed e-way bill.
 */
interface DocDefect {
  drop?: DocKind[];
  patch?: Partial<Record<DocKind, Record<string, string>>>;
}

const DOC_DEFECTS: Record<string, DocDefect> = {
  // Challan raised against a neighbouring dealer code.
  MALBB51RLSM104013: { patch: { DELIVERY_CHALLAN: { dealerCode: "KRD-CHD-041" } } },
  // Gate-out happened, e-way bill never got attached.
  MALBB51RLSM104004: { drop: ["EWAY_BILL"] },
  // Invoice uploaded before the IRN came back from the IRP.
  MALBB51RLSM104002: { patch: { INVOICE: { irn: "" } } },
  // Papers raised early; the e-way bill lapsed before the truck was loaded.
  MALBB51RLSM104005: { patch: { EWAY_BILL: { validTill: "2026-08-18" } } },
  // Allocation advice was raised for the lower variant — the paper trail the
  // vehicle's own stuck reason describes.
  MALBB51RLSM104010: { patch: { ALLOCATION: { variant: "SX" } } },
};

/** Builds the seeded document set for a vehicle list — deterministic, no I/O. */
export function buildDocuments(vehicles: Vehicle[]): ComplianceDoc[] {
  const docs: ComplianceDoc[] = [];

  for (const v of vehicles) {
    const defect = DOC_DEFECTS[v.vin];
    const total = v.invoice.amount + v.invoice.gst;
    const invoicedAt = v.stageTimestamps.INVOICED ?? `${v.invoice.date}T09:00:00+05:30`;

    const push = (kind: DocKind, reference: string, issuedAt: string, fields: Record<string, string>) => {
      if (defect?.drop?.includes(kind)) return;
      docs.push(makeDoc(v.vin, kind, reference, issuedAt, { ...fields, ...(defect?.patch?.[kind] ?? {}) }));
    };

    push("PRICE_CIRCULAR", v.priceCircularRef, `${v.priceCircularRef.slice(3)}T00:00:00+05:30`, {
      reference: v.priceCircularRef,
      effectiveFrom: v.priceCircularRef.slice(3),
      model: v.model,
      variant: v.variant,
      exShowroom: String(v.invoice.amount),
    });

    push("ALLOCATION", v.allocationRef, invoicedAt, {
      allocationRef: v.allocationRef,
      chassis: v.chassisShort,
      model: v.model,
      variant: v.variant,
      colour: v.colour,
      dealerCode: v.dealerCode,
    });

    push("INVOICE", v.invoice.number, invoicedAt, {
      invoiceNo: v.invoice.number,
      invoiceDate: v.invoice.date,
      chassis: v.chassisShort,
      model: v.model,
      variant: v.variant,
      colour: v.colour,
      dealerCode: v.dealerCode,
      amount: String(v.invoice.amount),
      gst: String(v.invoice.gst),
      total: String(total),
      priceCircularRef: v.priceCircularRef,
      irn: v.invoice.irn,
    });

    // Dispatch papers exist from the moment the plant raises them — including
    // the hero case, where they carry the wrong chassis and stop the car.
    if (v.dispatch.status !== "NOT_RAISED" && v.dispatch.raisedAt) {
      const onDocs = v.dispatch.chassisOnDocs ?? v.chassisShort;
      push("EWAY_BILL", v.dispatch.ewbNo ?? `EWB-${onDocs}-8841`, v.dispatch.raisedAt, {
        ewbNo: v.dispatch.ewbNo ?? `EWB-${onDocs}-8841`,
        chassis: onDocs,
        truckNo: v.lsp?.truckNo ?? "—",
        from: "Sriperumbudur (TN)",
        to: v.region,
        validTill: v.dispatch.validTill ?? "2026-08-25",
      });
      push("DELIVERY_CHALLAN", v.dispatch.challanNo ?? `DC-${onDocs}-2026`, v.dispatch.raisedAt, {
        challanNo: v.dispatch.challanNo ?? `DC-${onDocs}-2026`,
        chassis: onDocs,
        dealerCode: v.dealerCode,
        dealerName: v.dealerName,
        truckNo: v.lsp?.truckNo ?? "—",
      });
    }

    const delivered = v.stageTimestamps.DELIVERED;
    if (delivered) {
      push("POD", `POD-${v.chassisShort}`, delivered, {
        chassis: v.chassisShort,
        receivedBy: v.dealerName,
        at: delivered,
        condition: "No transit damage reported",
      });
    }
  }

  return docs;
}

export const DOCUMENTS: ComplianceDoc[] = buildDocuments(VEHICLES);
