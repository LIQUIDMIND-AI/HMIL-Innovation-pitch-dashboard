"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { getVehicleForRole, getVehicleTone } from "@/lib/selectors";
import { STAGE_LABELS, STAGE_ORDER, type Vehicle } from "@/lib/types";
import DashboardShell from "@/components/DashboardShell";
import StatusChip from "@/components/StatusChip";
import CheckRail from "@/components/CheckRail";
import DocCompare from "@/components/DocCompare";
import NotesThread from "@/components/NotesThread";
import VehicleActions from "@/components/VehicleActions";

function StageRail({ stage }: { stage: Vehicle["stage"] }) {
  const currentIndex = STAGE_ORDER.indexOf(stage);
  return (
    <ol className="flex flex-wrap items-center gap-1.5">
      {STAGE_ORDER.map((s, i) => {
        const reached = i <= currentIndex;
        return (
          <li key={s} className="flex items-center gap-1.5">
            <span
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${
                reached ? "bg-navy text-white" : "bg-navy-light text-ink-muted"
              }`}
            >
              {STAGE_LABELS[s]}
            </span>
            {i < STAGE_ORDER.length - 1 && (
              <span className="h-px w-4 bg-border" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

const ROLES_WITH_DOC_COMPARE = new Set(["hq", "plant", "ro", "dealer"]);
const ROLES_WITH_NOTES = new Set(["hq", "plant", "ro", "dealer"]);

export default function VehiclePage() {
  const { vin } = useParams<{ vin: string }>();
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!role) router.replace("/login");
  }, [role, router]);

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-ink-muted">
        Loading…
      </div>
    );
  }

  const vehicle = getVehicleForRole(role, vin);

  if (!vehicle) {
    return (
      <DashboardShell title="Vehicle not found">
        <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-ink-muted">
            This VIN isn&apos;t visible from your role, or doesn&apos;t exist.
          </p>
          <Link
            href={`/${role}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-navy hover:text-navy-hover"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const tone = getVehicleTone(vehicle);
  const chipLabel = tone === "clear" ? "CLEAR" : tone === "pending" ? "SUBSTITUTION" : "STUCK";
  const showDocCompare = ROLES_WITH_DOC_COMPARE.has(role);
  const showNotes = ROLES_WITH_NOTES.has(role);

  return (
    <DashboardShell title={`${vehicle.model} ${vehicle.variant} · •••${vehicle.chassisShort}`}>
      <div className="flex flex-col gap-6">
        <Link
          href={`/${role}`}
          className="inline-flex w-fit items-center gap-1 text-xs font-medium text-ink-muted hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to dashboard
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-surface p-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-ink">
                {vehicle.model} {vehicle.variant}
              </h2>
              <StatusChip tone={tone}>{chipLabel}</StatusChip>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              <span className="font-mono-vin">{vehicle.vin}</span> · {vehicle.colour} ·{" "}
              {vehicle.dealerName}
            </p>
            {vehicle.stuckReason && (
              <p
                className={`mt-2 max-w-2xl text-sm ${
                  tone === "pending" ? "text-pending" : "text-stuck"
                }`}
              >
                {vehicle.stuckReason}
              </p>
            )}
          </div>
          <VehicleActions vehicle={vehicle} />
        </div>

        <section aria-labelledby="stage-heading">
          <h3 id="stage-heading" className="mb-2 text-sm font-semibold text-ink">
            Pipeline stage
          </h3>
          <StageRail stage={vehicle.stage} />
        </section>

        <section aria-labelledby="checks-heading">
          <h3 id="checks-heading" className="mb-2 text-sm font-semibold text-ink">
            Cross-checks
          </h3>
          <CheckRail checks={vehicle.checks} />
        </section>

        {showDocCompare && (
          <section aria-labelledby="doc-heading">
            <h3 id="doc-heading" className="mb-2 text-sm font-semibold text-ink">
              Invoice vs Funding Confirmation
            </h3>
            <DocCompare vehicle={vehicle} />
          </section>
        )}

        {vehicle.lsp && (
          <section aria-labelledby="lsp-heading">
            <h3 id="lsp-heading" className="mb-2 text-sm font-semibold text-ink">
              Transit
            </h3>
            <div className="rounded-lg border border-border bg-surface p-4 text-sm">
              <p className="text-ink">
                {vehicle.lsp.name} · <span className="font-mono-vin">{vehicle.lsp.truckNo}</span>
              </p>
              <p className="mt-1 text-ink-muted">
                {vehicle.lsp.route} · ETA {vehicle.lsp.etaDays}d
              </p>
              <p className="mt-1 text-ink-muted">{vehicle.lsp.lastMilestone}</p>
            </div>
          </section>
        )}

        {showNotes && (
          <section aria-labelledby="notes-heading">
            <h3 id="notes-heading" className="mb-2 text-sm font-semibold text-ink">
              Notes
            </h3>
            <NotesThread notes={vehicle.notes} />
          </section>
        )}
      </div>
    </DashboardShell>
  );
}
