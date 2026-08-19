"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ALT_TRUCK_NO, useVehicleStore, LSP_MILESTONES, type LspMilestone } from "@/lib/store";
import type { Vehicle } from "@/lib/types";

const PRIMARY_BTN =
  "rounded-md bg-navy px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-hover disabled:cursor-not-allowed disabled:bg-ink-muted/40 disabled:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

const SECONDARY_BTN =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

function AddNoteControl({
  vin,
  authorRole,
}: {
  vin: string;
  authorRole: "hq" | "ro";
}) {
  const { persona } = useAuth();
  const { addNote } = useVehicleStore();
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState("");

  if (!persona) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !persona) return;
    addNote(vin, { author: persona.org, role: authorRole, text: trimmed });
    setText("");
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <button type="button" className={PRIMARY_BTN} onClick={() => setExpanded(true)}>
        Add Note
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:w-72">
      <label htmlFor={`note-${vin}`} className="sr-only">
        Note text
      </label>
      <textarea
        id={`note-${vin}`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        autoFocus
        placeholder="Add a note visible on this vehicle's thread…"
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={!text.trim()} className={PRIMARY_BTN}>
          Post Note
        </button>
        <button
          type="button"
          className={SECONDARY_BTN}
          onClick={() => {
            setExpanded(false);
            setText("");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function VehicleActions({ vehicle }: { vehicle: Vehicle }) {
  const { role, persona } = useAuth();
  const { receiveFunding, issueGatePass, updateLspMilestone, addNote, reassignCarrier } =
    useVehicleStore();

  if (!role || !persona) return null;

  switch (role) {
    case "hq":
      return (
        <div className="flex flex-wrap items-start gap-2">
          <button
            type="button"
            disabled={!vehicle.lsp || vehicle.lsp.truckNo === ALT_TRUCK_NO}
            title={
              !vehicle.lsp
                ? "Carrier not yet assigned (pre gate-out)"
                : vehicle.lsp.truckNo === ALT_TRUCK_NO
                  ? "Already reassigned"
                  : undefined
            }
            className={SECONDARY_BTN}
            onClick={() => reassignCarrier(vehicle.vin)}
          >
            Reassign Carrier
          </button>
          <button
            type="button"
            disabled={vehicle.overall !== "STUCK"}
            className={SECONDARY_BTN}
            onClick={() =>
              addNote(vehicle.vin, {
                author: persona.org,
                role: "hq",
                text: "Exception acknowledged by HQ.",
              })
            }
          >
            Acknowledge Exception
          </button>
          <AddNoteControl vin={vehicle.vin} authorRole="hq" />
        </div>
      );

    case "plant": {
      const failingCount = Object.values(vehicle.checks).filter((s) => s !== "CLEAR").length;
      const atFundingReceived = vehicle.stage === "FUNDING_RECEIVED";
      const canIssueGatePass = failingCount === 0 && atFundingReceived;
      const tooltip =
        failingCount > 0
          ? `${failingCount} of 5 checks failing`
          : !atFundingReceived
            ? "Awaiting funding confirmation"
            : undefined;
      return (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={!canIssueGatePass}
            title={tooltip}
            className={`${PRIMARY_BTN} self-start`}
            onClick={() => issueGatePass(vehicle.vin)}
          >
            Issue Gate Pass
          </button>
          {tooltip && <p className="text-xs text-ink-muted">{tooltip}</p>}
        </div>
      );
    }

    case "ro":
      return (
        <div className="flex flex-wrap items-start gap-2">
          <button
            type="button"
            disabled={vehicle.overall !== "STUCK"}
            className={SECONDARY_BTN}
            onClick={() =>
              addNote(vehicle.vin, {
                author: persona.org,
                role: "ro",
                text: "Escalated to HQ for review.",
              })
            }
          >
            Escalate to HQ
          </button>
          <AddNoteControl vin={vehicle.vin} authorRole="ro" />
        </div>
      );

    case "dealer": {
      const canConfirmFunding =
        vehicle.bank.status === "PENDING" && vehicle.stage === "FUNDING_PENDING";
      const canAcknowledgeDelivery = vehicle.stage === "DELIVERED";
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canConfirmFunding}
            title={
              !canConfirmFunding
                ? "Available once a routine funding confirmation is pending"
                : undefined
            }
            className={PRIMARY_BTN}
            onClick={() => receiveFunding(vehicle.vin)}
          >
            Confirm Funding Received
          </button>
          <button
            type="button"
            disabled={!canAcknowledgeDelivery}
            title={!canAcknowledgeDelivery ? "Available once the vehicle is delivered" : undefined}
            className={SECONDARY_BTN}
            onClick={() =>
              addNote(vehicle.vin, {
                author: persona.org,
                role: "dealer",
                text: "Proof of delivery acknowledged by dealer.",
              })
            }
          >
            Acknowledge Delivery (POD)
          </button>
        </div>
      );
    }

    case "bank": {
      const canRelease = vehicle.bank.status === "PENDING" && vehicle.stage === "FUNDING_PENDING";
      return (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={!canRelease}
            title={!canRelease ? "No pending funding request for this chassis" : undefined}
            className={`${PRIMARY_BTN} self-start`}
            onClick={() => receiveFunding(vehicle.vin)}
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
          {LSP_MILESTONES.map((milestone: LspMilestone) => (
            <button
              key={milestone}
              type="button"
              disabled={vehicle.stage === "DELIVERED"}
              className={SECONDARY_BTN}
              onClick={() => updateLspMilestone(vehicle.vin, milestone)}
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
