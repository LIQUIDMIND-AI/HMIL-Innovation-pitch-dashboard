"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO_NOW, VEHICLES } from "./mockData";
import type { Note, Vehicle } from "./types";

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

interface VehicleStoreContextValue {
  vehicles: Vehicle[];
  /** Dealer confirms / bank marks-released — same underlying event, two entry points. */
  receiveFunding: (vin: string) => void;
  issueGatePass: (vin: string) => void;
  updateLspMilestone: (vin: string, milestone: LspMilestone) => void;
  addNote: (vin: string, note: Omit<Note, "at">) => void;
  reassignCarrier: (vin: string) => void;
}

const VehicleStoreContext = createContext<VehicleStoreContextValue | undefined>(undefined);

function updateVehicle(
  vehicles: Vehicle[],
  vin: string,
  updater: (v: Vehicle) => Vehicle
): Vehicle[] {
  return vehicles.map((v) => (v.vin === vin ? updater(v) : v));
}

export function VehicleStoreProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES);

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

  const value = useMemo<VehicleStoreContextValue>(
    () => ({
      vehicles,
      receiveFunding,
      issueGatePass,
      updateLspMilestone,
      addNote,
      reassignCarrier,
    }),
    [vehicles, receiveFunding, issueGatePass, updateLspMilestone, addNote, reassignCarrier]
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
