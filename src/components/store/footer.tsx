import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";
import type { Category, SiteSettings } from "@/lib/types";
import { NewsletterForm } from "./newsletter-form";

/** Footer — contact rows appear only when real values exist in Settings. */
export function Footer({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  return (
    <footer className="border-t border-cocoa/10 bg-cream-deep">
      <div className="container-rk grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold">
            {settings.store_name}
          </p>
          <p className="mt-2 text-sm text-cocoa-soft">
            {settings.tagline ??
              "Handmade Middle Eastern food, baked in small batches for Calgary farmers' markets."}
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            {settings.instagram_url ? (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:underline"
              >
                <Instagram size={16} aria-hidden /> Instagram
              </a>
            ) : null}
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 hover:underline"
              >
                <Mail size={16} aria-hidden /> {settings.email}
              </a>
            ) : null}
            {settings.phone ? (
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center gap-2 hover:underline"
              >
                <Phone size={16} aria-hidden /> {settings.phone}
              </a>
            ) : null}
            {settings.whatsapp ? (
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:underline"
              >
                <Phone size={16} aria-hidden /> WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        <nav aria-label="Shop">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Shop
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/shop" className="hover:underline">
                All products
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/shop?category=${c.slug}`}
                  className="hover:underline"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Info">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Info
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/find-us" className="hover:underline">
                Find Us
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/about#faq" className="hover:underline">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/about#policies" className="hover:underline">
                Policies
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:underline">
                Account
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-sm text-cocoa-soft">
            {settings.payment_stripe_enabled
              ? "Pay online or at pickup."
              : "Pre-order online — pay at pickup (card or cash)."}
          </p>
        </nav>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Get This Week&apos;s Menu
          </p>
          <p className="mb-3 text-sm text-cocoa-soft">
            Market dates, fresh bakes and new products — straight to your inbox.
          </p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-cocoa/10 py-4">
        <p className="container-rk text-xs text-cocoa-soft">
          © {new Date().getFullYear()} {settings.store_name} · Calgary, Alberta
        </p>
      </div>
    </footer>
  );
}
