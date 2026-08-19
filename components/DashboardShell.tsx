import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto bg-canvas px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
