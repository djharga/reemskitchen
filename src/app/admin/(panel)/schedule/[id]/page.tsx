import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ScheduleForm } from "@/components/admin/schedule-form";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function EditSchedulePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data: schedule }, { data: locations }, { data: products }] =
    await Promise.all([
      supabase
        .from("market_schedules")
        .select("*, market_products(product_id)")
        .eq("id", params.id)
        .single(),
      supabase.from("locations").select("*").order("name"),
      supabase
        .from("products")
        .select("id, name")
        .eq("is_published", true)
        .order("name"),
    ]);
  if (!schedule) notFound();

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
          Market date — {formatDate(schedule.market_date)}
        </h1>
      </div>
      <ScheduleForm
        schedule={schedule}
        locations={locations ?? []}
        products={products ?? []}
      />
    </div>
  );
}
