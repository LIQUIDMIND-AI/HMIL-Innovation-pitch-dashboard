import RoleGate from "@/components/RoleGate";

export default function LspPage() {
  return (
    <RoleGate role="lsp">
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-ink-muted">hello lsp</p>
      </main>
    </RoleGate>
  );
}
