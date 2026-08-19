"use client";

import { useAuth } from "@/lib/auth";
import type { Vehicle } from "@/lib/types";

const PRIMARY_BTN =
  "rounded-md bg-navy px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-hover disabled:cursor-not-allowed disabled:bg-ink-muted/40 disabled:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

const SECONDARY_BTN =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

const LSP_MILESTONES = [
  "Departed",
  "In Transit",
  "Arrived at Stockyard",
  "Delivered to Dealer",
] as const;

/**
 * Role-scoped action buttons per plan.md §3. Gating logic (disabled states,
 * tooltips) is wired here; the click handlers become live mutations against
 * VehicleStoreContext in a later build step.
 */
export default function VehicleActions({ vehicle }: { vehicle: Vehicle }) {
  const { role } = useAuth();
  if (!role) return null;

  switch (role) {
    case "hq":
      return (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={SECONDARY_BTN}>
            Reassign Carrier
          </button>
          <button type="button" className={SECONDARY_BTN}>
            Acknowledge Exception
          </button>
          <button type="button" className={PRIMARY_BTN}>
            Add Note
          </button>
        </div>
      );

    case "plant": {
      const failingCount = Object.values(vehicle.checks).filter((s) => s !== "CLEAR").length;
      const canIssueGatePass = failingCount === 0;
      return (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={!canIssueGatePass}
            title={!canIssueGatePass ? `${failingCount} of 5 checks failing` : undefined}
            className={`${PRIMARY_BTN} self-start`}
          >
            Issue Gate Pass
          </button>
          {!canIssueGatePass && (
            <p className="text-xs text-ink-muted">{failingCount} of 5 checks failing</p>
          )}
        </div>
      );
    }

    case "ro":
      return (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={SECONDARY_BTN}>
            Escalate to HQ
          </button>
          <button type="button" className={PRIMARY_BTN}>
            Add Note
          </button>
        </div>
      );

    case "dealer": {
      const canConfirmFunding = vehicle.bank.status === "PENDING";
      const canAcknowledgeDelivery = vehicle.stage === "DELIVERED";
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canConfirmFunding}
            title={!canConfirmFunding ? "Funding confirmation already on file" : undefined}
            className={PRIMARY_BTN}
          >
            Confirm Funding Received
          </button>
          <button
            type="button"
            disabled={!canAcknowledgeDelivery}
            title={!canAcknowledgeDelivery ? "Available once the vehicle is delivered" : undefined}
            className={SECONDARY_BTN}
          >
            Acknowledge Delivery (POD)
          </button>
        </div>
      );
    }

    case "bank": {
      const canRelease = vehicle.bank.status === "PENDING";
      return (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={!canRelease}
            title={!canRelease ? "No pending funding request for this chassis" : undefined}
            className={`${PRIMARY_BTN} self-start`}
          >
            Mark Funding Released
          </button>
          <p className="text-xs text-ink-muted">
            Demo simulation of a bank email/portal confirmation.
          </p>
        </div>
      );
    }

    case "lsp":
      return (
        <div className="flex flex-wrap gap-2">
          {LSP_MILESTONES.map((milestone) => (
            <button
              key={milestone}
              type="button"
              disabled={vehicle.stage === "DELIVERED"}
              className={SECONDARY_BTN}
            >
              {milestone}
            </button>
          ))}
        </div>
      );

    default:
      return null;
  }
}
