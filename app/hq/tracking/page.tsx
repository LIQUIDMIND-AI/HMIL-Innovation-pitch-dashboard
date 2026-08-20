"use client";

import RoleGate from "@/components/RoleGate";
import DashboardShell from "@/components/DashboardShell";
import TrackingBoard from "@/components/TrackingBoard";

function HqTracking() {
  return (
    <DashboardShell
      title="Live tracking"
      caption="Every car of yours currently on the road, on the real network."
    >
      <TrackingBoard role="hq" />
    </DashboardShell>
  );
}

export default function HqTrackingPage() {
  return (
    <RoleGate role="hq">
      <HqTracking />
    </RoleGate>
  );
}
