"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { newsletterSchema } from "@/lib/validation";

export async function subscribeToNewsletter(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid email.",
    };
  }
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert(
      { email: parsed.data.email.toLowerCase() },
      { onConflict: "email" },
    );
  if (error)
    return { ok: false, message: "Something went wrong. Please try again." };
  return { ok: true, message: "You're on the list! See you at the market." };
}
