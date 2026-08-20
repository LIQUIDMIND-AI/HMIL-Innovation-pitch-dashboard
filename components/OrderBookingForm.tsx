"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarClock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useVehicleStore } from "@/lib/store";
import { computeAtp } from "@/lib/erp";
import { AVAILABLE_LINES } from "@/lib/selectors";
import AtpPanel from "./AtpPanel";

const INPUT =
  "min-h-11 rounded-lg border border-border bg-canvas px-3 text-sm text-ink outline-none focus:border-role";

/**
 * The dealer's booking desk. The availability preview updates as the dealer
 * types, so the order that reaches the manufacturer is one it can actually
 * promise — the ATP check is not a surprise sprung after submission.
 */
export default function OrderBookingForm() {
  const { persona } = useAuth();
  const { bookOrder } = useVehicleStore();

  const [model, setModel] = useState(AVAILABLE_LINES[0].model);
  const [variant, setVariant] = useState(AVAILABLE_LINES[0].variant);
  const [colour, setColour] = useState(AVAILABLE_LINES[0].colours[0]);
  const [qty, setQty] = useState(2);
  const [reference, setReference] = useState("");
  const [requestedDelivery, setRequestedDelivery] = useState("2026-09-05");
  const [placed, setPlaced] = useState<string | null>(null);

  const lines = AVAILABLE_LINES;
  const selectedLine = lines.find((l) => l.model === model && l.variant === variant) ?? lines[0];

  const preview = useMemo(
    () => computeAtp({ model, variant, colour, qty }),
    [model, variant, colour, qty]
  );

  function handleLineChange(value: string) {
    const [nextModel, nextVariant] = value.split("|");
    const line = lines.find((l) => l.model === nextModel && l.variant === nextVariant);
    setModel(nextModel);
    setVariant(nextVariant);
    if (line && !line.colours.includes(colour)) setColour(line.colours[0]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const order = bookOrder(
      {
        model,
        variant,
        colour,
        qty,
        reference: reference.trim() || "Dealer booking",
        requestedDelivery,
      },
      persona?.name ?? "Dealer"
    );
    setPlaced(order.id);
    setReference("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-surface p-5 shadow-card"
    >
      <h2 className="text-sm font-semibold text-ink">Book an order</h2>
      <p className="mt-1 text-xs text-ink-muted">
        Goes straight to the manufacturer&apos;s sales desk for an availability check — no email,
        no allocation spreadsheet.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="line" className="text-xs font-medium text-ink-muted">
            Model &amp; variant
          </label>
          <select
            id="line"
            className={INPUT}
            value={`${model}|${variant}`}
            onChange={(e) => handleLineChange(e.target.value)}
          >
            {lines.map((line) => (
              <option key={`${line.model}|${line.variant}`} value={`${line.model}|${line.variant}`}>
                {line.model} {line.variant}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="colour" className="text-xs font-medium text-ink-muted">
            Colour
          </label>
          <select
            id="colour"
            className={INPUT}
            value={colour}
            onChange={(e) => setColour(e.target.value)}
          >
            {selectedLine.colours.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Ranger Khaki">Ranger Khaki</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="qty" className="text-xs font-medium text-ink-muted">
            Units
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            max={40}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
            className={`${INPUT} font-mono-vin`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="requested" className="text-xs font-medium text-ink-muted">
            Wanted by
          </label>
          <input
            id="requested"
            type="date"
            value={requestedDelivery}
            onChange={(e) => setRequestedDelivery(e.target.value)}
            className={`${INPUT} font-mono-vin`}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="reference" className="text-xs font-medium text-ink-muted">
            What is it for?
          </label>
          <input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Diwali retail block, corporate fleet, walk-in booking…"
            className={INPUT}
          />
        </div>
      </div>

      <div className="mt-4">
        <AtpPanel
          order={{ model, variant, colour, qty, requestedDelivery }}
          plan={preview}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="flex min-h-11 items-center gap-1.5 rounded-lg bg-role px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <CalendarClock className="h-4 w-4" aria-hidden="true" />
          Send to manufacturer
        </button>
        {placed && (
          <p role="status" className="text-xs text-ink-muted">
            <span className="font-mono-vin text-ink">{placed}</span> is with the sales desk.
          </p>
        )}
      </div>
    </form>
  );
}
