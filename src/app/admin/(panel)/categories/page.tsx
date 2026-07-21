import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("sort_order", { ascending: true });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Categories</h1>
        <Link href="/admin/categories/new" className="btn-primary">
          Add category
        </Link>
      </div>

      {(categories ?? []).length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="font-medium">No categories yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-cocoa/10 text-left text-xs uppercase tracking-wide text-cocoa-soft">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Visible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/10">
              {(categories ?? []).map((c) => {
                const count = Array.isArray(c.products)
                  ? (c.products[0]?.count ?? 0)
                  : 0;
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3 text-cocoa-soft">
                      {c.sort_order}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/categories/${c.id}`}
                        className="font-medium text-lavender-deep underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{count}</td>
                    <td className="px-4 py-3">
                      {c.is_visible ? (
                        <span className="badge-available">Visible</span>
                      ) : (
                        <span className="badge bg-cocoa/10 text-cocoa-soft">
                          Hidden
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
