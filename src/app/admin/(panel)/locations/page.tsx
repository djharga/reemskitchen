import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLocationsPage() {
  const supabase = createClient();
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">
          Pickup locations
        </h1>
        <Link href="/admin/locations/new" className="btn-primary">
          Add location
        </Link>
      </div>

      {(locations ?? []).length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="font-medium">No locations yet.</p>
          <p className="mt-1 text-sm text-cocoa-soft">
            Add your first market or pickup spot — it powers the Find Us page
            and checkout.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-cocoa/10 text-left text-xs uppercase tracking-wide text-cocoa-soft">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Hours</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/10">
              {(locations ?? []).map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/locations/${l.id}`}
                      className="font-medium text-lavender-deep underline"
                    >
                      {l.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-cocoa-soft">
                    {l.address ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-cocoa-soft">
                    {l.hours_text ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {l.is_active ? (
                      <span className="badge-available">Active</span>
                    ) : (
                      <span className="badge bg-cocoa/10 text-cocoa-soft">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
