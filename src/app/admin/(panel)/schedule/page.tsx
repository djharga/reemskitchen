import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSchedulePage() {
  const supabase = createClient();
  const { data: schedules } = await supabase
    .from("market_schedules")
    .select("*, location:locations(name), market_products(product_id)")
    .order("market_date", { ascending: false });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Market schedule</h1>
        <Link href="/admin/schedule/new" className="btn-primary">
          Add market date
        </Link>
      </div>

      {(schedules ?? []).length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="font-medium">No market dates yet.</p>
          <p className="mt-1 text-sm text-cocoa-soft">
            Add a date to open pre-orders and fill the Find Us page.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-cocoa/10 text-left text-xs uppercase tracking-wide text-cocoa-soft">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Max orders</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/10">
              {(schedules ?? []).map((s) => {
                const location = Array.isArray(s.location)
                  ? s.location[0]
                  : s.location;
                return (
                  <tr key={s.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/schedule/${s.id}`}
                        className="font-medium text-lavender-deep underline"
                      >
                        {formatDate(s.market_date)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{location?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-cocoa-soft">
                      {formatTime(s.start_time)}–{formatTime(s.end_time)}
                    </td>
                    <td className="px-4 py-3 text-cocoa-soft">
                      {s.market_products?.length
                        ? `${s.market_products.length} selected`
                        : "All products"}
                    </td>
                    <td className="px-4 py-3 text-cocoa-soft">
                      {s.max_orders ?? "No limit"}
                    </td>
                    <td className="px-4 py-3">
                      {s.is_published ? (
                        <span className="badge-available">Published</span>
                      ) : (
                        <span className="badge bg-cocoa/10 text-cocoa-soft">
                          Draft
                        </span>
                      )}
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
