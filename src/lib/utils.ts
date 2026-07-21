import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Central price formatter. Prices are nullable BY DESIGN — a null price
 * renders "Price coming soon" (or "Contact for price" in compact spots)
 * instead of an invented number.
 */
export function formatPrice(
  cents: number | null | undefined,
  opts: { nullLabel?: string; currency?: string } = {},
): string {
  if (cents === null || cents === undefined) {
    return opts.nullLabel ?? "Price coming soon";
  }
  const currency = opts.currency ?? "CAD";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m ?? 0, 0, 0);
  return d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Open / Upcoming / Closed status for a market day. */
export function marketStatus(schedule: {
  market_date: string;
  start_time: string;
  end_time: string;
}): "open" | "upcoming" | "closed" {
  const now = new Date();
  const start = new Date(`${schedule.market_date}T${schedule.start_time}`);
  const end = new Date(`${schedule.market_date}T${schedule.end_time}`);
  if (now >= start && now <= end) return "open";
  if (now < start) return "upcoming";
  return "closed";
}

export function isPreorderOpen(schedule: {
  market_date: string;
  end_time: string;
  preorder_deadline: string | null;
}): boolean {
  const now = new Date();
  if (schedule.preorder_deadline) {
    return now < new Date(schedule.preorder_deadline);
  }
  return now < new Date(`${schedule.market_date}T${schedule.end_time}`);
}
