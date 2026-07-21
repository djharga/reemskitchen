import Link from "next/link";
import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
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
          Add category
        </h1>
      </div>
      <CategoryForm category={null} />
    </div>
  );
}
