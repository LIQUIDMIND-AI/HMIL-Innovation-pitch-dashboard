import {
  Building2,
  Factory,
  Landmark,
  MapPin,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/types";

export const ROLE_ICONS: Record<Role, LucideIcon> = {
  hq: Building2,
  plant: Factory,
  ro: MapPin,
  dealer: Store,
  bank: Landmark,
  lsp: Truck,
};

export default function PersonaIcon({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  const Icon = ROLE_ICONS[role];
  return <Icon className={className} aria-hidden="true" />;
}
