import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (!settings) {
    return (
      <div className="card px-6 py-12 text-center">
        <p className="font-medium">Settings row not found.</p>
        <p className="mt-1 text-sm text-cocoa-soft">
          Run the seed migration (supabase/migrations/0002_seed.sql) to create
          it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
