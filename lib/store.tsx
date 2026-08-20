"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEALERS,
  DEMO_NOW,
  DOCUMENTS,
  ORDERS,
  VEHICLES,
  bankForDealer,
  makeDoc,
} from "./mockData";
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
  /** Dealer confirms / bank marks-released — same underlying event, two entry points. */
  receiveFunding: (vin: string) => void;
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
  /** Bank issues its confirmation; the document lands on the manufacturer's and the dealer's copy at once. */
  issueFundingConfirmation: (vin: string, input: { chassis: string; amount: number }) => void;
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

  const receiveFunding = useCallback((vin: string) => {
    setVehicles((prev) =>
      updateVehicle(prev, vin, (v) => {
        if (v.bank.status !== "PENDING" || v.stage !== "FUNDING_PENDING") return v;
        const checks = { ...v.checks, chassisMatch: "CLEAR" as const, fundingPresent: "CLEAR" as const };
        const overall = Object.values(checks).every((s) => s === "CLEAR")
          ? ("CLEAR" as const)
          : ("STUCK" as const);
        return {
          ...v,
          bank: {
            ...v.bank,
            status: "RECEIVED",
            chassisOnConfirmation: v.chassisShort,
            amount: v.invoice.amount,
            receivedAt: DEMO_NOW,
          },
          checks,
          overall,
          stuckReason: overall === "CLEAR" ? undefined : v.stuckReason,
          stage: "FUNDING_RECEIVED",
          stageTimestamps: { ...v.stageTimestamps, FUNDING_RECEIVED: DEMO_NOW },
        };
      })
    );
  }, []);

  const issueGatePass = useCallback((vin: string) => {
    setVehicles((prev) =>
      updateVehicle(prev, vin, (v) => {
        const allClear = Object.values(v.checks).every((s) => s === "CLEAR");
        if (!allClear || v.stage !== "FUNDING_RECEIVED") return v;
        return {
          ...v,
          stage: "GATE_OUT",
          stageTimestamps: { ...v.stageTimestamps, GATE_OUT: DEMO_NOW },
        };
      })
    );
  }, []);

  const updateLspMilestone = useCallback((vin: string, milestone: LspMilestone) => {
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
  }, []);

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
          bank: { name: bankForDealer(order.dealerCode), status: "PENDING" },
          checks: {
            chassisMatch: "PENDING",
            variantColourMatch: "CLEAR",
            priceMatch: "CLEAR",
            fundingPresent: "PENDING",
            taxTotalsMatch: "CLEAR",
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

  /**
   * The bank issues once. The confirmation is not emailed anywhere — it lands on
   * the shared record, where the manufacturer, the plant, the RO and the dealer
   * all read the same copy, and the compliance rules re-run against it.
   */
  const issueFundingConfirmation = useCallback(
    (vin: string, input: { chassis: string; amount: number }) => {
      const vehicle = vehicles.find((v) => v.vin === vin);
      if (!vehicle) return;
      const matches = input.chassis === vehicle.chassisShort;

      setVehicles((prev) =>
        updateVehicle(prev, vin, (v) => {
          const checks = {
            ...v.checks,
            chassisMatch: matches ? ("CLEAR" as const) : ("MISMATCH" as const),
            fundingPresent: "CLEAR" as const,
          };
          const overall = Object.values(checks).every((c) => c === "CLEAR")
            ? ("CLEAR" as const)
            : ("STUCK" as const);
          return {
            ...v,
            bank: {
              ...v.bank,
              status: matches ? "RECEIVED" : "MISMATCH",
              chassisOnConfirmation: input.chassis,
              amount: input.amount,
              receivedAt: DEMO_NOW,
            },
            checks,
            overall,
            stuckReason: matches
              ? undefined
              : `Bank funding confirmation cites chassis ${input.chassis}, invoice says ${v.chassisShort} — gate pass blocked until chassis numbers match.`,
            stage: "FUNDING_RECEIVED",
            stageTimestamps: { ...v.stageTimestamps, FUNDING_RECEIVED: DEMO_NOW },
          };
        })
      );

      setDocuments((prev) => [
        ...prev.filter((d) => !(d.vin === vin && d.kind === "FUNDING_CONFIRMATION")),
        makeDoc(vin, "FUNDING_CONFIRMATION", `FC-${input.chassis}-2026`, DEMO_NOW, {
          bank: vehicle.bank.name,
          chassis: input.chassis,
          amount: String(input.amount),
          receivedAt: DEMO_NOW,
          dealerCode: vehicle.dealerCode,
        }),
      ]);
    },
    [vehicles]
  );

  const value = useMemo<VehicleStoreContextValue>(
    () => ({
      vehicles,
      orders,
      documents,
      receiveFunding,
      issueGatePass,
      updateLspMilestone,
      addNote,
      reassignCarrier,
      bookOrder,
      verifyOrder,
      rejectOrder,
      raiseInvoiceForOrder,
      issueFundingConfirmation,
    }),
    [
      vehicles,
      orders,
      documents,
      receiveFunding,
      issueGatePass,
      updateLspMilestone,
      addNote,
      reassignCarrier,
      bookOrder,
      verifyOrder,
      rejectOrder,
      raiseInvoiceForOrder,
      issueFundingConfirmation,
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
