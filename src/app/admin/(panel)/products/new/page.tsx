import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-lavender-deep underline"
        >
          ← Back to products
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          Add product
        </h1>
      </div>
      <ProductForm product={null} categories={categories ?? []} />
    </div>
  );
}
