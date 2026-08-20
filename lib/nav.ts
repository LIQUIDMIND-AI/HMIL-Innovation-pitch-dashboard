import {
  LayoutDashboard,
  GitBranch,
  AlertTriangle,
  Building2,
  ClipboardList,
  ShieldCheck,
  Truck,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  hq: [
    { label: "Overview", href: "/hq", icon: LayoutDashboard },
    { label: "Order Book", href: "/hq/orders", icon: ClipboardList },
    { label: "Pipeline", href: "/hq/pipeline", icon: GitBranch },
    { label: "Tracking", href: "/hq/tracking", icon: MapPin },
    { label: "Compliance", href: "/hq/compliance", icon: ShieldCheck },
    { label: "Exceptions", href: "/hq/exceptions", icon: AlertTriangle },
  ],
  plant: [
    { label: "Overview", href: "/plant", icon: LayoutDashboard },
    { label: "Gate-out Queue", href: "/plant/queue", icon: Truck },
    { label: "Compliance", href: "/plant/compliance", icon: ShieldCheck },
    { label: "Exceptions", href: "/plant/exceptions", icon: AlertTriangle },
  ],
  ro: [
    { label: "Overview", href: "/ro", icon: LayoutDashboard },
    { label: "Dealer Rollup", href: "/ro/dealers", icon: Building2 },
    { label: "Pipeline", href: "/ro/pipeline", icon: GitBranch },
    { label: "Tracking", href: "/ro/tracking", icon: MapPin },
    { label: "Compliance", href: "/ro/compliance", icon: ShieldCheck },
    { label: "Exceptions", href: "/ro/exceptions", icon: AlertTriangle },
  ],
  dealer: [
    { label: "Overview", href: "/dealer", icon: LayoutDashboard },
    { label: "My Orders", href: "/dealer/orders", icon: ClipboardList },
    { label: "Pipeline", href: "/dealer/pipeline", icon: GitBranch },
    { label: "Tracking", href: "/dealer/tracking", icon: MapPin },
    { label: "Compliance", href: "/dealer/compliance", icon: ShieldCheck },
    { label: "Exceptions", href: "/dealer/exceptions", icon: AlertTriangle },
  ],
  lsp: [
    { label: "Overview", href: "/lsp", icon: LayoutDashboard },
    { label: "Assigned Trips", href: "/lsp/trips", icon: Truck },
    { label: "Tracking", href: "/lsp/tracking", icon: MapPin },
    { label: "Exceptions", href: "/lsp/exceptions", icon: AlertTriangle },
  ],
};
