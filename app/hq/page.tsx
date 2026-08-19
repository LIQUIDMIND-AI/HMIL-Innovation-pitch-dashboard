import RoleGate from "@/components/RoleGate";

export default function HqPage() {
  return (
    <RoleGate role="hq">
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-ink-muted">hello hq</p>
      </main>
    </RoleGate>
  );
}
