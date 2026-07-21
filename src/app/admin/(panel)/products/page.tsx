import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { ProductDeleteButton } from "@/components/admin/product-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, price_cents, stock_quantity, is_published, is_featured, is_sold_out, is_demo, available_this_week, category:categories(name)",
    )
    .order("created_at", { ascending: false });
  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }
  const { data: products } = await query;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          Add product
        </Link>
      </div>

      <form method="get" className="flex gap-2">
        <label htmlFor="prod-search" className="sr-only">
          Search products
        </label>
        <input
          id="prod-search"
          name="q"
          type="search"
          className="input max-w-xs"
          placeholder="Search products…"
          defaultValue={searchParams.q ?? ""}
        />
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      {(products ?? []).length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <p className="font-medium">No products found.</p>
          <p className="mt-1 text-sm text-cocoa-soft">
            Add your first product to start selling.
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-cocoa/10 text-left text-xs uppercase tracking-wide text-cocoa-soft">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cocoa/10">
              {(products ?? []).map((p) => {
                const category = Array.isArray(p.category)
                  ? p.category[0]
                  : p.category;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-medium text-lavender-deep underline"
                      >
                        {p.name}
                      </Link>
                      {p.is_demo ? (
                        <span className="ms-2 rounded bg-cocoa/10 px-1.5 py-0.5 text-[11px] font-medium text-cocoa-soft">
                          Demo data
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-cocoa-soft">
                      {category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {p.price_cents !== null ? (
                        formatPrice(p.price_cents)
                      ) : (
                        <span className="text-cocoa-soft">No price yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.stock_quantity !== null ? (
                        p.stock_quantity
                      ) : (
                        <span className="text-cocoa-soft">Untracked</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1">
                        {p.is_published ? (
                          <span className="badge-available">Live</span>
                        ) : (
                          <span className="badge bg-cocoa/10 text-cocoa-soft">
                            Hidden
                          </span>
                        )}
                        {p.is_featured ? (
                          <span className="badge bg-terracotta-soft text-terracotta">
                            Featured
                          </span>
                        ) : null}
                        {p.is_sold_out ? (
                          <span className="badge-soldout">Sold out</span>
                        ) : null}
                        {p.available_this_week ? (
                          <span className="badge bg-olive-soft text-olive">
                            This week
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProductDeleteButton id={p.id} name={p.name} />
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
