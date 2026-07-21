import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/order-actions";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: Array<{ value: OrderStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const supabase = createClient();
  const status =
    searchParams.status && searchParams.status !== "all"
      ? searchParams.status
      : null;

  let query = supabase
    .from("orders")
    .select(
      "*, schedule:market_schedules(market_date, location:locations(name))",
    )
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (searchParams.q) {
    query = query.or(
      `order_number.ilike.%${searchParams.q}%,customer_name.ilike.%${searchParams.q}%,customer_email.ilike.%${searchParams.q}%`,
    );
  }
  const { data: orders } = await query;

  const exportHref = `/admin/orders/export${status ? `?status=${status}` : ""}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Orders</h1>
        <a href={exportHref} className="btn-secondary">
          Export CSV
        </a>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by status"
      >
        {STATUSES.map((s) => {
          const isActive = (searchParams.status ?? "all") === s.value;
          return (
            <Link
              key={s.value}
              href={
                s.value === "all"
                  ? "/admin/orders"
                  : `/admin/orders?status=${s.value}`
              }
              className={`rounded-full border px-3.5 py-1.5 text-sm ${
                isActive
                  ? "border-lavender-deep bg-lavender-deep text-white"
                  : "border-cocoa/20 bg-white"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      <form method="get" className="flex gap-2">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <label htmlFor="order-search" className="sr-only">
          Search orders
        </label>
        <input
          id="order-search"
          name="q"
          type="search"
          className="input max-w-xs"
          placeholder="Order #, name or email…"
          defaultValue={searchParams.q ?? ""}
        />
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      {(orders ?? []).length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="font-medium">No orders found.</p>
          <p className="mt-1 text-sm text-cocoa-soft">
            New pre-orders will appear here.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-cocoa/10 text-left text-xs uppercase tracking-wide text-cocoa-soft">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Pickup</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Placed</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/10">
              {(orders ?? []).map((o) => {
                const schedule = Array.isArray(o.schedule)
                  ? o.schedule[0]
                  : o.schedule;
                const location = Array.isArray(schedule?.location)
                  ? schedule?.location[0]
                  : schedule?.location;
                return (
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono font-medium text-lavender-deep underline"
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-xs text-cocoa-soft">
                        {o.customer_email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-cocoa-soft">
                      {schedule
                        ? `${formatDate(schedule.market_date)} · ${location?.name ?? ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(o.total_cents)}
                      {o.has_unpriced_items ? (
                        <span className="text-xs text-cocoa-soft"> +TBD</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-cocoa-soft">
                      {formatDateTime(o.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusSelect orderId={o.id} status={o.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
