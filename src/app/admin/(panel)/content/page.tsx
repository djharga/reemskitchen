import { createClient } from "@/lib/supabase/server";
import { ContentBlockEditor } from "@/components/admin/content-editor";
import type { ContentBlock } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const supabase = createClient();
  const { data } = await supabase.from("content_blocks").select("*");
  const blocks = new Map<string, ContentBlock>(
    (data ?? []).map((b) => [b.key, b]),
  );

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Content</h1>
        <p className="mt-1 text-sm text-cocoa-soft">
          Homepage texts, the brand story, FAQ and policies. The announcement
          bar lives in Settings.
        </p>
      </div>

      <ContentBlockEditor
        blockKey="hero"
        heading="Hero (homepage)"
        description="Main title, subtitle, buttons and photo at the top of the homepage."
        block={blocks.get("hero")}
        withImage
        extraFields={[
          {
            key: "primary_cta",
            label: "Primary button label",
            placeholder: "Shop the Menu",
          },
          {
            key: "secondary_cta",
            label: "Secondary button label",
            placeholder: "Find Us This Week",
          },
        ]}
      />

      <ContentBlockEditor
        blockKey="story"
        heading="Reem's story"
        description="Shown on the homepage and the About page. Replace the placeholder text with the real story."
        block={blocks.get("story")}
        withImage
      />

      <ContentBlockEditor
        blockKey="custom_orders"
        heading="Bundles & party orders"
        description="Intro text for the bundles section and custom order requests."
        block={blocks.get("custom_orders")}
        extraFields={[
          {
            key: "cta",
            label: "Button label",
            placeholder: "Request a Custom Order",
          },
        ]}
      />

      <ContentBlockEditor
        blockKey="faq"
        heading="FAQ"
        description="Questions shown on the About page (and used for FAQ search results)."
        block={blocks.get("faq")}
        withFaq
      />

      <ContentBlockEditor
        blockKey="policies"
        heading="Policies"
        description="Pickup, refund and food-handling policies shown on the About page."
        block={blocks.get("policies")}
      />
    </div>
  );
}
