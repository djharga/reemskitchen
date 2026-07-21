import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { CustomerNote } from "@/components/admin/customer-note";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  let query = supabase
    .from("customers")
    .select("*, orders(id, order_number, status, total_cents, created_at)")
    .order("created_at", { ascending: false });
  if (searchParams.q) {
    query = query.or(
      `name.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`,
    );
  }
  const { data: customers } = await query;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold">Customers</h1>

      <form method="get" className="flex gap-2">
        <label htmlFor="cust-search" className="sr-only">
          Search customers
        </label>
        <input
          id="cust-search"
          name="q"
          type="search"
          className="input max-w-xs"
          placeholder="Name or email…"
          defaultValue={searchParams.q ?? ""}
        />
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      {(customers ?? []).length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="font-medium">No customers yet.</p>
          <p className="mt-1 text-sm text-cocoa-soft">
            Customers appear here automatically after their first order.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {(customers ?? []).map((c) => {
            const orders = (c.orders ?? []) as Array<{
              id: string;
              order_number: string;
              status: string;
              total_cents: number;
              created_at: string;
            }>;
            const totalSpend = orders
              .filter((o) => o.status !== "cancelled")
              .reduce((sum, o) => sum + o.total_cents, 0);
            return (
              <details key={c.id} className="card p-5">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                  <span>
                    <span className="font-semibold">{c.name}</span>
                    <span className="ms-2 text-sm text-cocoa-soft">
                      {c.email}
                    </span>
                    {c.phone ? (
                      <span className="ms-2 text-sm text-cocoa-soft">
                        {c.phone}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sm">
                    {orders.length} order{orders.length === 1 ? "" : "s"} ·{" "}
                    <span className="font-semibold">
                      {formatPrice(totalSpend)}
                    </span>
                  </span>
                </summary>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold">
                      Order history
                    </h3>
                    {orders.length === 0 ? (
                      <p className="text-sm text-cocoa-soft">No orders.</p>
                    ) : (
                      <ul className="divide-y divide-cocoa/10 rounded border border-cocoa/10 text-sm">
                        {orders
                          .slice()
                          .sort((a, b) =>
                            a.created_at < b.created_at ? 1 : -1,
                          )
                          .map((o) => (
                            <li
                              key={o.id}
                              className="flex items-center justify-between gap-3 px-3 py-2"
                            >
                              <a
                                href={`/admin/orders/${o.id}`}
                                className="font-mono font-medium text-lavender-deep underline"
                              >
                                {o.order_number}
                              </a>
                              <span className="capitalize text-cocoa-soft">
                                {o.status.replace(/_/g, " ")}
                              </span>
                              <span>{formatPrice(o.total_cents)}</span>
                              <span className="text-xs text-cocoa-soft">
                                {formatDateTime(o.created_at)}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                  <CustomerNote customerId={c.id} note={c.notes} />
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
