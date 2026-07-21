import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocationForm } from "@/components/admin/location-form";

export const dynamic = "force-dynamic";

export default async function EditLocationPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("id", params.id)
    .single();
  if (!location) notFound();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/locations"
          className="text-sm text-lavender-deep underline"
        >
          ← Back to locations
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          {location.name}
        </h1>
      </div>
      <LocationForm location={location} />
    </div>
  );
}
