"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { ALT_TRUCK_NO, useVehicleStore, LSP_MILESTONES, type LspMilestone } from "@/lib/store";
import type { Vehicle } from "@/lib/types";

const PRIMARY_BTN =
  "min-h-11 rounded-md bg-navy px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-hover disabled:cursor-not-allowed disabled:bg-ink-muted/40 disabled:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

const SECONDARY_BTN =
  "min-h-11 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";

function AddNoteControl({
  vin,
  authorRole,
}: {
  vin: string;
  authorRole: "hq" | "ro" | "dealer";
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
    addNote(vin, { author: persona.name, role: authorRole, text: trimmed });
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
  const {
    verifyDocuments,
    raiseDispatchPapers,
    issueGatePass,
    updateLspMilestone,
    addNote,
    reassignCarrier,
  } = useVehicleStore();

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
                author: persona.name,
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
      const failing = Object.entries(vehicle.checks).filter(([, v]) => v === "MISMATCH");
      const canVerify = vehicle.stage === "ALLOCATION_MATCHED" && failing.length === 0;
      const canRaisePapers = vehicle.stage === "DOCS_VERIFIED";
      const canIssueGatePass = vehicle.stage === "DISPATCH_READY" && failing.length === 0;
      const blockedNote =
        failing.length > 0
          ? `${failing.length} of 5 checks failing`
          : vehicle.stage === "ALLOCATION_MATCHED"
            ? "Cross-check the documents to clear this car"
            : vehicle.stage === "DOCS_VERIFIED"
              ? "Raise the e-way bill and challan to release the gate pass"
              : undefined;

      return (
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!canVerify}
              title={!canVerify ? blockedNote : undefined}
              className={SECONDARY_BTN}
              onClick={() => verifyDocuments(vehicle.vin)}
            >
              Verify Documents
            </button>
            <button
              type="button"
              disabled={!canRaisePapers}
              title={!canRaisePapers ? "Available once every check is clear" : undefined}
              className={SECONDARY_BTN}
              onClick={() => raiseDispatchPapers(vehicle.vin)}
            >
              Raise Dispatch Papers
            </button>
            <button
              type="button"
              disabled={!canIssueGatePass}
              title={!canIssueGatePass ? blockedNote : undefined}
              className={PRIMARY_BTN}
              onClick={() => issueGatePass(vehicle.vin)}
            >
              Issue Gate Pass
            </button>
          </div>
          {blockedNote && <p className="text-xs text-ink-muted">{blockedNote}</p>}
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
                author: persona.name,
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
      const canAcknowledgeDelivery = vehicle.stage === "DELIVERED";
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!canAcknowledgeDelivery}
            title={!canAcknowledgeDelivery ? "Available once the vehicle is delivered" : undefined}
            className={PRIMARY_BTN}
            onClick={() =>
              addNote(vehicle.vin, {
                author: persona.name,
                role: "dealer",
                text: "Proof of delivery acknowledged by dealer.",
              })
            }
          >
            Acknowledge Delivery (POD)
          </button>
          <AddNoteControl vin={vehicle.vin} authorRole="dealer" />
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
