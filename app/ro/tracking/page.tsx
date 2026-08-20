"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import TrackingBoard from "@/components/TrackingBoard";

function RoTracking() {
  return (
    <DashboardShell
      title="Live tracking"
      caption="Every car of yours currently on the road, on the real network."
    >
      <TrackingBoard role="ro" />
    </DashboardShell>
  );
}

export default function RoTrackingPage() {
  return (
    <RoleGate role="ro">
      <RoTracking />
    </RoleGate>
  );
}
