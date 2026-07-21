import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/admin/category-form";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/categories"
          className="text-sm text-lavender-deep underline"
        >
          ← Back to categories
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          {category.name}
        </h1>
      </div>
      <CategoryForm category={category} />
    </div>
  );
}
