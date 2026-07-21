import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "*, category:categories(*), images:product_images(*), variants:product_variants(*)",
      )
      .eq("id", params.id)
      .single(),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-lavender-deep underline"
        >
          ← Back to products
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold">
            {product.name}
          </h1>
          {product.is_demo ? (
            <span className="rounded bg-cocoa/10 px-1.5 py-0.5 text-[11px] font-medium text-cocoa-soft">
              Demo data — replace with your real product
            </span>
          ) : null}
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="text-sm text-lavender-deep underline"
          target="_blank"
        >
          View in store ↗
        </Link>
      </div>
      <ProductForm product={product as Product} categories={categories ?? []} />
    </div>
  );
}
