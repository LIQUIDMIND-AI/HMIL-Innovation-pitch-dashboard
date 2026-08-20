"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEALERS, DEMO_NOW, DOCUMENTS, ORDERS, VEHICLES, makeDoc } from "./mockData";
import { computeAtp, findAvailability } from "./erp";
import type {
  AtpPlan,
  ComplianceDoc,
  Note,
  Order,
  Vehicle,
} from "./types";

export const LSP_MILESTONES = [
  "Departed",
  "In Transit",
  "Arrived at Stockyard",
  "Delivered to Dealer",
] as const;

export type LspMilestone = (typeof LSP_MILESTONES)[number];

const MILESTONE_TEXT: Record<LspMilestone, string> = {
  Departed: "Departed plant, on schedule",
  "In Transit": "In transit — on schedule",
  "Arrived at Stockyard": "Arrived at regional stockyard",
  "Delivered to Dealer": "Delivered to dealer",
};

/**
 * "Reassign carrier" only swaps the truck, never the carrier name — the LSP
 * persona's scope is hardcoded to Speedline Logistics (see LSP_SCOPE_NAME in
 * selectors.ts), so switching the carrier itself would silently vanish the
 * vehicle from the LSP's own dashboard mid-demo.
 */
export const ALT_TRUCK_NO = "PB-08-CX-9021";

/** What the dealer fills in when booking; everything else is derived. */
export interface OrderDraft {
  model: string;
  variant: string;
  colour: string;
  qty: number;
  reference: string;
  requestedDelivery: string;
}

interface VehicleStoreContextValue {
  vehicles: Vehicle[];
  orders: Order[];
  documents: ComplianceDoc[];
  /** Plant clears the cross-document checks on a car. */
  verifyDocuments: (vin: string) => void;
  /** Plant raises the e-way bill + delivery challan. `chassisOnDocs` exists so the
   *  mis-key that strands a car can be demonstrated live. */
  raiseDispatchPapers: (vin: string, chassisOnDocs?: string) => void;
  issueGatePass: (vin: string) => void;
  updateLspMilestone: (vin: string, milestone: LspMilestone) => void;
  addNote: (vin: string, note: Omit<Note, "at">) => void;
  reassignCarrier: (vin: string) => void;
  /** ERP — dealer side. */
  bookOrder: (draft: OrderDraft, placedBy: string) => Order;
  /** ERP — manufacturer side. */
  verifyOrder: (orderId: string, plan: AtpPlan, verifiedBy: string) => void;
  rejectOrder: (orderId: string, reason: string, verifiedBy: string) => void;
  /** Raises the dummy invoice(s) for a verified order and puts the cars on the pipeline. */
  raiseInvoiceForOrder: (orderId: string) => string[];
}

const VehicleStoreContext = createContext<VehicleStoreContextValue | undefined>(undefined);

function updateVehicle(
  vehicles: Vehicle[],
  vin: string,
  updater: (v: Vehicle) => Vehicle
): Vehicle[] {
  return vehicles.map((v) => (v.vin === vin ? updater(v) : v));
}

/** VINs minted by the invoice flow live in their own block, after the 14 seeded cars. */
const MINTED_VIN_PREFIX = "MALBB51RLSM1050";

/** Deterministic VIN minting — sequence continues from the seeded block. */
function mintVin(index: number): string {
  return `${MINTED_VIN_PREFIX}${String(index).padStart(2, "0")}`;
}

/** Deterministic stand-in for an IRP acknowledgement — no randomness anywhere. */
function mintIrn(vin: string): string {
  let hash = 0;
  for (let i = 0; i < vin.length; i += 1) hash = (hash * 31 + vin.charCodeAt(i)) >>> 0;
  return hash.toString(16).padStart(8, "0").repeat(4).slice(0, 32);
}

export function VehicleStoreProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [documents, setDocuments] = useState<ComplianceDoc[]>(DOCUMENTS);

  const verifyDocuments = useCallback((vin: string) => {
    setVehicles((prev) =>
      updateVehicle(prev, vin, (v) => {
        if (v.stage !== "ALLOCATION_MATCHED") return v;
        const contentChecks = [
          v.checks.chassisMatch,
          v.checks.variantColourMatch,
          v.checks.priceMatch,
          v.checks.taxTotalsMatch,
        ];
        if (contentChecks.some((c) => c === "MISMATCH")) return v;
        const checks = {
          ...v.checks,
          chassisMatch: "CLEAR" as const,
          variantColourMatch: "CLEAR" as const,
          priceMatch: "CLEAR" as const,
          taxTotalsMatch: "CLEAR" as const,
        };
        return {
          ...v,
          checks,
          overall: "CLEAR" as const,
          stuckReason: undefined,
          stage: "DOCS_VERIFIED" as const,
          stageTimestamps: { ...v.stageTimestamps, DOCS_VERIFIED: DEMO_NOW },
        };
      })
    );
  }, []);

  /**
   * Raising the dispatch papers is the moment the goods flow and the document
   * flow meet: the e-way bill and challan go onto the shared record, and the
   * compliance rules immediately re-run against them.
   */
  const raiseDispatchPapers = useCallback((vin: string, chassisOnDocs?: string) => {
    setVehicles((prev) =>
      updateVehicle(prev, vin, (v) => {
        if (v.stage !== "DOCS_VERIFIED") return v;
        const onDocs = (chassisOnDocs ?? v.chassisShort).trim() || v.chassisShort;
        const matches = onDocs === v.chassisShort;
        const checks = {
          ...v.checks,
          chassisMatch: matches ? ("CLEAR" as const) : ("MISMATCH" as const),
          dispatchDocsPresent: matches ? ("CLEAR" as const) : ("MISMATCH" as const),
        };
        return {
          ...v,
          dispatch: {
            status: matches ? ("RAISED" as const) : ("MISMATCH" as const),
            ewbNo: `EWB-${onDocs}-8841`,
            challanNo: `DC-${onDocs}-2026`,
            chassisOnDocs: onDocs,
            validTill: "2026-08-25",
            raisedAt: DEMO_NOW,
          },
          checks,
          overall: matches ? ("CLEAR" as const) : ("STUCK" as const),
          stuckReason: matches
            ? undefined
            : `Dispatch papers were raised against chassis ${onDocs}; the invoice is for ${v.chassisShort} — the gate pass stays blocked until the e-way bill and the invoice agree.`,
          stage: matches ? ("DISPATCH_READY" as const) : v.stage,
          stageTimestamps: matches
            ? { ...v.stageTimestamps, DISPATCH_READY: DEMO_NOW }
            : v.stageTimestamps,
        };
      })
    );

    setDocuments((prev) => {
      const vehicle = vehicles.find((v) => v.vin === vin);
      if (!vehicle) return prev;
      const onDocs = (chassisOnDocs ?? vehicle.chassisShort).trim() || vehicle.chassisShort;
      const rest = prev.filter(
        (d) => !(d.vin === vin && (d.kind === "EWAY_BILL" || d.kind === "DELIVERY_CHALLAN"))
      );
      return [
        ...rest,
        makeDoc(vin, "EWAY_BILL", `EWB-${onDocs}-8841`, DEMO_NOW, {
          ewbNo: `EWB-${onDocs}-8841`,
          chassis: onDocs,
          truckNo: vehicle.lsp?.truckNo ?? "—",
          from: "Sriperumbudur (TN)",
          to: vehicle.region,
          validTill: "2026-08-25",
        }),
        makeDoc(vin, "DELIVERY_CHALLAN", `DC-${onDocs}-2026`, DEMO_NOW, {
          challanNo: `DC-${onDocs}-2026`,
          chassis: onDocs,
          dealerCode: vehicle.dealerCode,
          dealerName: vehicle.dealerName,
          truckNo: vehicle.lsp?.truckNo ?? "—",
        }),
      ];
    });
  }, [vehicles]);

  const issueGatePass = useCallback((vin: string) => {
    setVehicles((prev) =>
      updateVehicle(prev, vin, (v) => {
        const allClear = Object.values(v.checks).every((s) => s !== "MISMATCH");
        if (!allClear || v.stage !== "DISPATCH_READY") return v;
        return {
          ...v,
          stage: "GATE_OUT",
          stageTimestamps: { ...v.stageTimestamps, GATE_OUT: DEMO_NOW },
        };
      })
    );
  }, []);

  const updateLspMilestone = useCallback(
    (vin: string, milestone: LspMilestone) => {
      setVehicles((prev) =>
        updateVehicle(prev, vin, (v) => {
          if (!v.lsp) return v;
          const nextStage = milestone === "Delivered to Dealer" ? "DELIVERED" : "IN_TRANSIT";
          return {
            ...v,
            lsp: { ...v.lsp, lastMilestone: MILESTONE_TEXT[milestone] },
            stage: nextStage,
            stageTimestamps: { ...v.stageTimestamps, [nextStage]: DEMO_NOW },
          };
        })
      );

      // Delivery closes the document loop: the POD lands on the shared record.
      if (milestone !== "Delivered to Dealer") return;
      setDocuments((prev) => {
        const vehicle = vehicles.find((v) => v.vin === vin);
        if (!vehicle || prev.some((d) => d.vin === vin && d.kind === "POD")) return prev;
        return [
          ...prev,
          makeDoc(vin, "POD", `POD-${vehicle.chassisShort}`, DEMO_NOW, {
            chassis: vehicle.chassisShort,
            receivedBy: vehicle.dealerName,
            at: DEMO_NOW,
            condition: "No transit damage reported",
          }),
        ];
      });
    },
    [vehicles]
  );

  const addNote = useCallback((vin: string, note: Omit<Note, "at">) => {
    setVehicles((prev) =>
      updateVehicle(prev, vin, (v) => ({
        ...v,
        notes: [...v.notes, { ...note, at: DEMO_NOW }],
      }))
    );
  }, []);

  const reassignCarrier = useCallback((vin: string) => {
    setVehicles((prev) =>
      updateVehicle(prev, vin, (v) => {
        if (!v.lsp) return v;
        return { ...v, lsp: { ...v.lsp, truckNo: ALT_TRUCK_NO } };
      })
    );
  }, []);

  const bookOrder = useCallback(
    (draft: OrderDraft, placedBy: string) => {
      const order: Order = {
        id: `ORD-KRD-2026-0${400 + orders.length}`,
        ...DEALERS.KRISHNA,
        model: draft.model,
        variant: draft.variant,
        colour: draft.colour,
        qty: draft.qty,
        reference: draft.reference,
        requestedDelivery: draft.requestedDelivery,
        placedBy,
        placedAt: DEMO_NOW,
        status: "SUBMITTED",
        invoicedVins: [],
      };
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [orders.length]
  );

  const verifyOrder = useCallback((orderId: string, plan: AtpPlan, verifiedBy: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "VERIFIED", plan, verifiedBy, verifiedAt: DEMO_NOW }
          : o
      )
    );
  }, []);

  const rejectOrder = useCallback((orderId: string, reason: string, verifiedBy: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "REJECTED",
              rejectionReason: reason,
              plan: o.plan ?? computeAtp(o),
              verifiedBy,
              verifiedAt: DEMO_NOW,
            }
          : o
      )
    );
  }, []);

  /**
   * The manufacturer raising the invoice is what puts a car on the shared
   * record: one Vehicle per unit, plus the three documents (price circular,
   * allocation, invoice) that every other party immediately reads.
   */
  const raiseInvoiceForOrder = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order || order.status !== "VERIFIED") return [];
      const record = findAvailability(order.model, order.variant);
      if (!record) return [];

      const startIndex =
        orders.flatMap((o) => o.invoicedVins).filter((vin) => vin.startsWith(MINTED_VIN_PREFIX))
          .length + 1;

      const newVehicles: Vehicle[] = [];
      const newDocs: ComplianceDoc[] = [];
      const minted: string[] = [];
      const invoiceDate = DEMO_NOW.slice(0, 10);

      for (let i = 0; i < order.qty; i += 1) {
        const seq = startIndex + i;
        const vin = mintVin(seq);
        const chassisShort = vin.slice(-4);
        const invoiceNo = `HMIL-INV-2026-08-${1200 + seq}`;
        const allocationRef = `ALC-CHD-2026-09${String(seq).padStart(2, "0")}`;
        const irn = mintIrn(vin);

        newVehicles.push({
          vin,
          chassisShort,
          model: order.model,
          variant: order.variant,
          colour: order.colour,
          dealerCode: order.dealerCode,
          dealerName: order.dealerName,
          region: order.region,
          invoice: {
            number: invoiceNo,
            date: invoiceDate,
            amount: record.price,
            gst: record.gst,
            irn,
          },
          allocationRef,
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
          stage: "INVOICED",
          stageTimestamps: { INVOICED: DEMO_NOW },
          notes: [
            {
              author: "Ananya Sharma",
              role: "hq",
              text: `Invoiced against ${order.id} — ${order.reference}.`,
              at: DEMO_NOW,
            },
          ],
        });
        minted.push(vin);

        newDocs.push(
          makeDoc(vin, "PRICE_CIRCULAR", "PC-2026-08-01", DEMO_NOW, {
            reference: "PC-2026-08-01",
            effectiveFrom: "2026-08-01",
            model: order.model,
            variant: order.variant,
            exShowroom: String(record.price),
          }),
          makeDoc(vin, "ALLOCATION", allocationRef, DEMO_NOW, {
            allocationRef,
            chassis: chassisShort,
            model: order.model,
            variant: order.variant,
            colour: order.colour,
            dealerCode: order.dealerCode,
          }),
          makeDoc(vin, "INVOICE", invoiceNo, DEMO_NOW, {
            invoiceNo,
            invoiceDate,
            chassis: chassisShort,
            model: order.model,
            variant: order.variant,
            colour: order.colour,
            dealerCode: order.dealerCode,
            amount: String(record.price),
            gst: String(record.gst),
            total: String(record.price + record.gst),
            priceCircularRef: "PC-2026-08-01",
            irn,
          })
        );
      }

      setVehicles((prev) => [...prev, ...newVehicles]);
      setDocuments((prev) => [...prev, ...newDocs]);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "INVOICED", invoicedVins: minted } : o
        )
      );

      return minted;
    },
    [orders]
  );

  const value = useMemo<VehicleStoreContextValue>(
    () => ({
      vehicles,
      orders,
      documents,
      verifyDocuments,
      raiseDispatchPapers,
      issueGatePass,
      updateLspMilestone,
      addNote,
      reassignCarrier,
      bookOrder,
      verifyOrder,
      rejectOrder,
      raiseInvoiceForOrder,
    }),
    [
      vehicles,
      orders,
      documents,
      verifyDocuments,
      raiseDispatchPapers,
      issueGatePass,
      updateLspMilestone,
      addNote,
      reassignCarrier,
      bookOrder,
      verifyOrder,
      rejectOrder,
      raiseInvoiceForOrder,
    ]
  );

  return (
    <VehicleStoreContext.Provider value={value}>{children}</VehicleStoreContext.Provider>
  );
}

export function useVehicleStore(): VehicleStoreContextValue {
  const ctx = useContext(VehicleStoreContext);
  if (!ctx) throw new Error("useVehicleStore must be used within a VehicleStoreProvider");
  return ctx;
}
