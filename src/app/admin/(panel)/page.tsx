import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient();

  const [ordersRes, productsRes, lowStockRes, upcomingRes, itemsRes] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, order_number, status, total_cents, created_at, customer_name, schedule:market_schedules(market_date, location:locations(name))",
        )
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, is_published", { count: "exact" }),
      supabase
        .from("products")
        .select("id, name, stock_quantity, low_stock_threshold")
        .not("stock_quantity", "is", null),
      supabase
        .from("orders")
        .select(
          "id, order_number, customer_name, status, schedule:market_schedules(market_date, location:locations(name))",
        )
        .in("status", ["new", "confirmed", "preparing", "ready_for_pickup"])
        .order("created_at", { ascending: true })
        .limit(8),
      supabase.from("order_items").select("product_name, quantity"),
    ]);

  const orders = ordersRes.data ?? [];
  const active = orders.filter((o) => o.status !== "cancelled");
  const totalSalesCents = active.reduce(
    (sum, o) => sum + (o.total_cents ?? 0),
    0,
  );
  const activeProducts = (productsRes.data ?? []).filter(
    (p) => p.is_published,
  ).length;
  const lowStock = (lowStockRes.data ?? []).filter(
    (p) => (p.stock_quantity ?? 0) <= (p.low_stock_threshold ?? 3),
  );

  // Orders per pickup location
  const byLocation = new Map<string, number>();
  for (const o of active) {
    const schedule = Array.isArray(o.schedule) ? o.schedule[0] : o.schedule;
    const loc = Array.isArray(schedule?.location)
      ? schedule?.location[0]
      : schedule?.location;
    const name = loc?.name ?? "No pickup set";
    byLocation.set(name, (byLocation.get(name) ?? 0) + 1);
  }

  // Top products by quantity ordered
  const byProduct = new Map<string, number>();
  for (const item of itemsRes.data ?? []) {
    byProduct.set(
      item.product_name,
      (byProduct.get(item.product_name) ?? 0) + item.quantity,
    );
  }
  const topProducts = Array.from(byProduct.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stats = [
    { label: "Orders", value: String(orders.length) },
    { label: "Total sales", value: formatPrice(totalSalesCents) },
    { label: "Active products", value: String(activeProducts) },
    { label: "Low stock", value: String(lowStock.length) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-cocoa-soft">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="dash-upcoming">
          <h2 id="dash-upcoming" className="mb-3 font-semibold">
            Upcoming orders
          </h2>
          {(upcomingRes.data ?? []).length === 0 ? (
            <p className="text-sm text-cocoa-soft">No open orders right now.</p>
          ) : (
            <ul className="divide-y divide-cocoa/10 text-sm">
              {(upcomingRes.data ?? []).map((o) => {
                const schedule = Array.isArray(o.schedule)
                  ? o.schedule[0]
                  : o.schedule;
                const loc = Array.isArray(schedule?.location)
                  ? schedule?.location[0]
                  : schedule?.location;
                return (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <span>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono font-medium text-lavender-deep underline"
                      >
                        {o.order_number}
                      </Link>{" "}
                      · {o.customer_name}
                    </span>
                    <span className="text-cocoa-soft">
                      {schedule
                        ? `${formatDate(schedule.market_date)} · ${loc?.name ?? ""}`
                        : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-5" aria-labelledby="dash-locations">
          <h2 id="dash-locations" className="mb-3 font-semibold">
            Orders by pickup location
          </h2>
          {byLocation.size === 0 ? (
            <p className="text-sm text-cocoa-soft">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-cocoa/10 text-sm">
              {Array.from(byLocation.entries()).map(([name, count]) => (
                <li
                  key={name}
                  className="flex items-center justify-between py-2"
                >
                  <span>{name}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5" aria-labelledby="dash-top">
          <h2 id="dash-top" className="mb-3 font-semibold">
            Top products
          </h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-cocoa-soft">No order data yet.</p>
          ) : (
            <ul className="divide-y divide-cocoa/10 text-sm">
              {topProducts.map(([name, qty]) => (
                <li
                  key={name}
                  className="flex items-center justify-between py-2"
                >
                  <span>{name}</span>
                  <span className="font-semibold">{qty} ordered</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5" aria-labelledby="dash-lowstock">
          <h2 id="dash-lowstock" className="mb-3 font-semibold">
            Low stock
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-cocoa-soft">
              All tracked products are stocked.
            </p>
          ) : (
            <ul className="divide-y divide-cocoa/10 text-sm">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-2"
                >
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-lavender-deep underline"
                  >
                    {p.name}
                  </Link>
                  <span className="font-semibold text-terracotta">
                    {p.stock_quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
