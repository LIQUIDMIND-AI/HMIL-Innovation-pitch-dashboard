import { AVAILABILITY, DEMO_NOW } from "./mockData";
import type { AtpPlan, AvailabilityRecord, Order } from "./types";

/** Date-only arithmetic on the fixed demo clock — never `new Date()` on its own. */
export function addDays(isoDate: string, days: number): string {
  const base = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(`${from.slice(0, 10)}T00:00:00Z`).getTime();
  const b = new Date(`${to.slice(0, 10)}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Line-haul time from Sriperumbudur, by destination region. */
const TRANSIT_DAYS = 4;
/** Days to marshal a finished car out of the yard onto a carrier. */
const DISPATCH_DAYS = 3;

export function findAvailability(
  model: string,
  variant: string
): AvailabilityRecord | undefined {
  return AVAILABILITY.find((a) => a.model === model && a.variant === variant);
}

/**
 * Available-to-promise: what the manufacturer can actually commit to, split
 * between finished stock that can go on a truck now and units that still have
 * to be built. This is the check the sales team runs before verifying a
 * dealer's order.
 */
export function computeAtp(
  order: Pick<Order, "model" | "variant" | "colour" | "qty">,
  today: string = DEMO_NOW
): AtpPlan {
  const record = findAvailability(order.model, order.variant);

  if (!record) {
    return {
      verdict: "CONSTRAINED",
      fromStock: 0,
      toManufacture: 0,
      transportBy: "—",
      promisedDelivery: "—",
      constraint: `${order.model} ${order.variant} is not on the current production plan.`,
    };
  }

  if (!record.colours.includes(order.colour)) {
    return {
      verdict: "CONSTRAINED",
      fromStock: 0,
      toManufacture: 0,
      transportBy: "—",
      promisedDelivery: "—",
      constraint: `${order.colour} is not produced on the ${order.model} ${order.variant} line — offered colours are ${record.colours.join(", ")}.`,
    };
  }

  const fromStock = Math.min(order.qty, record.readyToTransport);
  const toManufacture = order.qty - fromStock;

  if (toManufacture > record.buildSlotCapacity) {
    return {
      verdict: "CONSTRAINED",
      fromStock,
      toManufacture,
      transportBy: "—",
      promisedDelivery: "—",
      constraint: `The next ${order.model} ${order.variant} slot can absorb ${record.buildSlotCapacity} units; this order needs ${toManufacture} built.`,
    };
  }

  const manufactureBy = toManufacture > 0 ? addDays(today, record.buildSlotDays) : undefined;
  const transportBy = manufactureBy ? addDays(manufactureBy, 1) : addDays(today, DISPATCH_DAYS);
  const promisedDelivery = addDays(transportBy, TRANSIT_DAYS);

  return {
    verdict: toManufacture === 0 ? "FROM_STOCK" : fromStock > 0 ? "PART_STOCK" : "BUILD_TO_ORDER",
    fromStock,
    toManufacture,
    manufactureBy,
    transportBy,
    promisedDelivery,
  };
}

/** Negative = the promise lands after the date the dealer asked for. */
export function slackAgainstRequest(plan: AtpPlan, requestedDelivery: string): number | null {
  if (plan.promisedDelivery === "—") return null;
  return daysBetween(plan.promisedDelivery, requestedDelivery);
}
