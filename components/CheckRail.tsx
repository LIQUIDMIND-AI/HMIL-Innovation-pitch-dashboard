"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Clock, X } from "lucide-react";
import type { CheckStatus, VehicleChecks } from "@/lib/types";

const CHECK_LABELS: Record<keyof VehicleChecks, string> = {
  chassisMatch: "Chassis Match",
  variantColourMatch: "Variant & Colour Match",
  priceMatch: "Price Match",
  taxTotalsMatch: "Tax Totals Match",
  dispatchDocsPresent: "Dispatch Papers",
};

const CHECK_ORDER: (keyof VehicleChecks)[] = [
  "chassisMatch",
  "variantColourMatch",
  "priceMatch",
  "taxTotalsMatch",
  "dispatchDocsPresent",
];

const TONE_CLASSES: Record<CheckStatus, string> = {
  CLEAR: "border-clear/20 bg-clear-bg text-clear",
  MISMATCH: "border-stuck/20 bg-stuck-bg text-stuck",
  PENDING: "border-pending/20 bg-pending-bg text-pending",
};

function CheckIcon({ status }: { status: CheckStatus }) {
  if (status === "CLEAR") return <Check className="h-4 w-4 shrink-0" aria-hidden="true" />;
  if (status === "MISMATCH") return <X className="h-4 w-4 shrink-0" aria-hidden="true" />;
  return <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />;
}

/** Re-runs a brief staggered "resolve" animation whenever the check verdicts change (e.g. once the plant raises the dispatch papers). */
export default function CheckRail({ checks }: { checks: VehicleChecks }) {
  const prevRef = useRef(checks);
  const [justUpdated, setJustUpdated] = useState(false);

  useEffect(() => {
    const changed = CHECK_ORDER.some((key) => prevRef.current[key] !== checks[key]);
    prevRef.current = checks;
    if (!changed) return;
    setJustUpdated(true);
    const timer = setTimeout(() => setJustUpdated(false), 900);
    return () => clearTimeout(timer);
  }, [checks]);

  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {CHECK_ORDER.map((key, i) => {
        const status = checks[key];
        return (
          <li
            key={key}
            style={justUpdated ? { animationDelay: `${i * 60}ms` } : undefined}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${
              TONE_CLASSES[status]
            } ${justUpdated ? "animate-check-resolve" : ""}`}
          >
            <CheckIcon status={status} />
            <span>{CHECK_LABELS[key]}</span>
          </li>
        );
      })}
    </ul>
  );
}
