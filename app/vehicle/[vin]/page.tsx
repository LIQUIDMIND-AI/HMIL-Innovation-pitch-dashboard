"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useVehicleStore } from "@/lib/store";
import {
  findVehicleForRole,
  getAlertsForVehicle,
  getDocumentsForVehicle,
  getVehicleTone,
} from "@/lib/selectors";
import DashboardShell from "@/components/DashboardShell";
import StatusChip from "@/components/StatusChip";
import CheckRail from "@/components/CheckRail";
import DocCompare from "@/components/DocCompare";
import JourneyRail from "@/components/JourneyRail";
import DocumentList from "@/components/DocumentList";
import ComplianceAlerts from "@/components/ComplianceAlerts";
import NotesThread from "@/components/NotesThread";
import VehicleActions from "@/components/VehicleActions";

const ROLES_WITH_DOC_COMPARE = new Set(["hq", "plant", "ro", "dealer"]);
const ROLES_WITH_NOTES = new Set(["hq", "plant", "ro", "dealer"]);

export default function VehiclePage() {
  const { vin } = useParams<{ vin: string }>();
  const { role } = useAuth();
  const { vehicles, documents } = useVehicleStore();
  const router = useRouter();

  useEffect(() => {
    if (!role) router.replace("/login");
  }, [role, router]);

  if (!role) return null;

  const vehicle = findVehicleForRole(vehicles, role, vin);

  if (!vehicle) {
    return (
      <DashboardShell
        title="Vehicle not found"
        caption="This VIN isn't visible from your role, or doesn't exist."
      >
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-ink-muted">
            Role scoping is deliberate — you only ever see the cars your entity owns a stake in.
          </p>
          <Link
            href={`/${role}`}
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-role"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const docs = getDocumentsForVehicle(documents, vehicles, role, vehicle.vin);
  const findings = getAlertsForVehicle(vehicles, documents, role, vehicle.vin);
  const tone = getVehicleTone(vehicle);
  const chipLabel = tone === "clear" ? "CLEAR" : tone === "pending" ? "SUBSTITUTION" : "STUCK";
  const showDocCompare = ROLES_WITH_DOC_COMPARE.has(role);
  const showNotes = ROLES_WITH_NOTES.has(role);

  return (
    <DashboardShell
      title={`${vehicle.model} ${vehicle.variant}`}
      caption={`${vehicle.colour} · ${vehicle.dealerName} · ${vehicle.region}`}
    >
      <nav aria-label="Breadcrumb" className="-mt-2 flex flex-wrap items-center gap-1.5 text-xs">
        <Link
          href={`/${role}`}
          className="inline-flex items-center gap-1 font-medium text-ink-muted hover:text-role"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Dashboard
        </Link>
        <span className="text-ink-muted" aria-hidden="true">
          /
        </span>
        <span className="font-mono-vin font-medium text-ink">•••{vehicle.chassisShort}</span>
      </nav>

      {/* The rail is the hero: one glance answers "where is this car, and is it moving?" */}
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl leading-tight text-ink">
                {vehicle.model} {vehicle.variant}
              </h2>
              <StatusChip tone={tone}>{chipLabel}</StatusChip>
            </div>
            <p className="font-mono-vin mt-1 text-xs text-ink-muted">{vehicle.vin}</p>
          </div>
          <VehicleActions vehicle={vehicle} />
        </div>

        <div className="mt-8 px-1">
          <JourneyRail vehicle={vehicle} size="full" showTimestamps />
        </div>

        {vehicle.stuckReason && (
          <p
            className={`mt-6 rounded-lg border px-3 py-2.5 text-sm ${
              tone === "pending"
                ? "border-pending/30 bg-pending-bg text-pending"
                : "border-stuck/30 bg-stuck-bg text-stuck"
            }`}
          >
            {vehicle.stuckReason}
          </p>
        )}
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

      <section aria-labelledby="docs-heading">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="docs-heading" className="text-sm font-semibold text-ink">
            Documents on the shared record
          </h3>
          <span className="text-xs text-ink-muted">
            {docs.length} document{docs.length === 1 ? "" : "s"} visible to you
          </span>
        </div>
        {findings.length > 0 && (
          <div className="mb-3">
            <ComplianceAlerts findings={findings} />
          </div>
        )}
        <DocumentList docs={docs} findings={findings} />
      </section>

      {vehicle.lsp && (
        <section aria-labelledby="lsp-heading">
          <h3 id="lsp-heading" className="mb-2 text-sm font-semibold text-ink">
            Transit
          </h3>
          <div className="rounded-xl border border-border bg-surface p-5 text-sm shadow-card">
            <p className="text-ink">
              {vehicle.lsp.name} ·{" "}
              <span className="font-mono-vin">{vehicle.lsp.truckNo}</span>
            </p>
            <p className="mt-1 text-ink-muted">
              {vehicle.lsp.route} · ETA{" "}
              <span className="font-mono-vin">{vehicle.lsp.etaDays}d</span>
            </p>
            <p
              className={`mt-1 font-medium ${
                vehicle.lsp.lastMilestone.toLowerCase().includes("delayed")
                  ? "text-pending"
                  : "text-ink-muted"
              }`}
            >
              {vehicle.lsp.lastMilestone}
            </p>
            {(role === "dealer" || role === "lsp") && (
              <Link
                href={`/${role}/tracking`}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-role hover:underline"
              >
                View on map →
              </Link>
            )}
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
    </DashboardShell>
  );
}
