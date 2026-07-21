"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { saveSettings } from "@/app/actions/admin";
import { ImageUpload } from "./image-upload";
import { SaveBanner } from "./ui";

const COLOR_TOKENS: Array<{ key: string; label: string; hint: string }> = [
  {
    key: "lavender",
    label: "Lavender Blue",
    hint: "Brand accent (from the logo)",
  },
  { key: "lavender-deep", label: "Lavender Deep", hint: "Links & emphasis" },
  { key: "cream", label: "Warm Cream", hint: "Page background" },
  { key: "cream-deep", label: "Cream Deep", hint: "Section background" },
  { key: "honey", label: "Honey Gold", hint: "Buttons" },
  { key: "honey-deep", label: "Honey Deep", hint: "Button hover" },
  { key: "olive", label: "Olive Green", hint: "Vegan accents" },
  { key: "olive-soft", label: "Olive Soft", hint: "Vegan backgrounds" },
  { key: "terracotta", label: "Terracotta", hint: "Warm details" },
  {
    key: "terracotta-soft",
    label: "Terracotta Soft",
    hint: "Warm backgrounds",
  },
  { key: "cocoa", label: "Dark Brown", hint: "Text" },
  { key: "cocoa-soft", label: "Brown Soft", hint: "Muted text" },
];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const [storeName, setStoreName] = useState(settings.store_name ?? "");
  const [tagline, setTagline] = useState(settings.tagline ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(
    settings.logo_url ?? null,
  );
  const [announcementText, setAnnouncementText] = useState(
    settings.announcement_text ?? "",
  );
  const [announcementHref, setAnnouncementHref] = useState(
    settings.announcement_href ?? "",
  );
  const [phone, setPhone] = useState(settings.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp ?? "");
  const [email, setEmail] = useState(settings.email ?? "");
  const [instagramUrl, setInstagramUrl] = useState(
    settings.instagram_url ?? "",
  );
  const [facebookUrl, setFacebookUrl] = useState(settings.facebook_url ?? "");
  const [currency, setCurrency] = useState(settings.currency ?? "CAD");
  const [taxRatePercent, setTaxRatePercent] = useState(
    settings.tax_rate_percent !== null &&
      settings.tax_rate_percent !== undefined
      ? String(settings.tax_rate_percent)
      : "0",
  );
  const [payAtPickupEnabled, setPayAtPickupEnabled] = useState(
    settings.payment_pay_at_pickup_enabled ?? true,
  );
  const [stripeEnabled, setStripeEnabled] = useState(
    settings.payment_stripe_enabled ?? false,
  );
  const [discountsEnabled, setDiscountsEnabled] = useState(
    settings.discounts_enabled ?? false,
  );
  const [paymentMethodsText, setPaymentMethodsText] = useState(
    settings.payment_methods_text ?? "",
  );
  const [pickupPolicy, setPickupPolicy] = useState(
    settings.pickup_policy ?? "",
  );
  const [seoTitle, setSeoTitle] = useState(settings.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    settings.seo_description ?? "",
  );
  const [brandColors, setBrandColors] = useState<Record<string, string>>(
    (settings.brand_colors as Record<string, string> | null) ?? {},
  );

  async function handleSave() {
    setSaving(true);
    setBanner(null);
    const result = await saveSettings({
      storeName,
      tagline,
      logoUrl,
      announcementText,
      announcementHref,
      phone,
      whatsapp,
      email,
      instagramUrl,
      facebookUrl,
      currency,
      taxRatePercent: Number(taxRatePercent) || 0,
      payAtPickupEnabled,
      stripeEnabled,
      discountsEnabled,
      paymentMethodsText,
      pickupPolicy,
      seoTitle,
      seoDescription,
      brandColors,
    });
    setBanner(
      result.ok
        ? { ok: true, message: "Settings saved." }
        : { ok: false, message: result.error },
    );
    setSaving(false);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <SaveBanner state={banner} />

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Brand</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="st-name" className="label">
              Store name
            </label>
            <input
              id="st-name"
              className="input"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="st-tagline" className="label">
              Tagline
            </label>
            <input
              id="st-tagline"
              className="input"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
        </div>
        <ImageUpload
          bucket="brand"
          value={logoUrl}
          onChange={setLogoUrl}
          label="Logo"
        />
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Announcement bar</h2>
        <div>
          <label htmlFor="st-ann" className="label">
            Message (empty hides the bar)
          </label>
          <input
            id="st-ann"
            className="input"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Find us this Saturday at the Farmers' Market"
          />
        </div>
        <div>
          <label htmlFor="st-annhref" className="label">
            Link (e.g. /find-us)
          </label>
          <input
            id="st-annhref"
            className="input"
            value={announcementHref}
            onChange={(e) => setAnnouncementHref(e.target.value)}
            placeholder="/find-us"
          />
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Contact & social</h2>
        <p className="text-sm text-cocoa-soft">
          Leave any field empty and it simply won&apos;t appear in the store —
          nothing is ever invented.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="st-phone" className="label">
              Phone
            </label>
            <input
              id="st-phone"
              type="tel"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="st-wa" className="label">
              WhatsApp number (digits only, with country code)
            </label>
            <input
              id="st-wa"
              className="input"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="15551234567"
            />
          </div>
          <div>
            <label htmlFor="st-email" className="label">
              Email
            </label>
            <input
              id="st-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="st-ig" className="label">
              Instagram URL
            </label>
            <input
              id="st-ig"
              type="url"
              className="input"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="st-fb" className="label">
              Facebook URL
            </label>
            <input
              id="st-fb"
              type="url"
              className="input"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Payments & pickup</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="st-currency" className="label">
              Currency
            </label>
            <input
              id="st-currency"
              className="input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="st-tax" className="label">
              Tax rate % (0 = no tax line)
            </label>
            <input
              id="st-tax"
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={taxRatePercent}
              onChange={(e) => setTaxRatePercent(e.target.value)}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={payAtPickupEnabled}
            onChange={(e) => setPayAtPickupEnabled(e.target.checked)}
          />
          Pay at pickup enabled
        </label>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={stripeEnabled}
              onChange={(e) => setStripeEnabled(e.target.checked)}
            />
            Stripe online payment enabled
          </label>
          <p className="mt-1 text-xs text-cocoa-soft">
            Online payment only appears at checkout when this is on AND the
            Stripe keys are set in the environment variables — no fake payment
            buttons.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={discountsEnabled}
            onChange={(e) => setDiscountsEnabled(e.target.checked)}
          />
          Discount codes enabled at checkout
        </label>
        <div>
          <label htmlFor="st-paytext" className="label">
            Payment methods text (footer)
          </label>
          <input
            id="st-paytext"
            className="input"
            value={paymentMethodsText}
            onChange={(e) => setPaymentMethodsText(e.target.value)}
            placeholder="Pay at pickup · Cash · Card"
          />
        </div>
        <div>
          <label htmlFor="st-pickup" className="label">
            Pickup policy
          </label>
          <textarea
            id="st-pickup"
            rows={3}
            className="input"
            value={pickupPolicy}
            onChange={(e) => setPickupPolicy(e.target.value)}
          />
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">SEO</h2>
        <div>
          <label htmlFor="st-seotitle" className="label">
            Meta title
          </label>
          <input
            id="st-seotitle"
            className="input"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="st-seodesc" className="label">
            Meta description
          </label>
          <textarea
            id="st-seodesc"
            rows={2}
            className="input"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Brand colors (design tokens)</h2>
        <p className="text-sm text-cocoa-soft">
          Override any token to restyle the whole store instantly. Leave a token
          empty to use the default palette.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {COLOR_TOKENS.map((token) => (
            <div key={token.key} className="flex items-center gap-3">
              <input
                type="color"
                aria-label={`${token.label} color`}
                className="h-9 w-9 shrink-0 cursor-pointer rounded border border-cocoa/20"
                value={brandColors[token.key] ?? "#ffffff"}
                onChange={(e) =>
                  setBrandColors((prev) => ({
                    ...prev,
                    [token.key]: e.target.value,
                  }))
                }
              />
              <div className="min-w-0">
                <p className="text-sm font-medium">{token.label}</p>
                <p className="truncate text-xs text-cocoa-soft">{token.hint}</p>
              </div>
              {brandColors[token.key] ? (
                <button
                  type="button"
                  className="ms-auto text-xs text-terracotta underline"
                  onClick={() =>
                    setBrandColors((prev) => {
                      const next = { ...prev };
                      delete next[token.key];
                      return next;
                    })
                  }
                >
                  Reset
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4">
        <button
          type="button"
          className="btn-primary w-full shadow-lg sm:w-auto"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
