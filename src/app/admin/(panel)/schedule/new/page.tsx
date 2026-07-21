import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ScheduleForm } from "@/components/admin/schedule-form";

export const dynamic = "force-dynamic";

export default async function NewSchedulePage() {
  const supabase = createClient();
  const [{ data: locations }, { data: products }] = await Promise.all([
    supabase.from("locations").select("*").eq("is_active", true).order("name"),
    supabase
      .from("products")
      .select("id, name")
      .eq("is_published", true)
      .order("name"),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/schedule"
          className="text-sm text-lavender-deep underline"
        >
          ← Back to schedule
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          Add market date
        </h1>
      </div>
      <ScheduleForm
        schedule={null}
        locations={locations ?? []}
        products={products ?? []}
      />
    </div>
  );
}
