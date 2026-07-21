import type { Product, SiteSettings } from "@/lib/types";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** LocalBusiness schema — only includes fields that actually have values. */
export function LocalBusinessJsonLd({ settings }: { settings: SiteSettings }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: settings.store_name,
    url: siteUrl,
    servesCuisine: "Middle Eastern",
    areaServed: { "@type": "City", name: "Calgary" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Calgary",
      addressRegion: "AB",
      addressCountry: "CA",
    },
  };
  if (settings.seo_description) data.description = settings.seo_description;
  if (settings.phone) data.telephone = settings.phone;
  if (settings.email) data.email = settings.email;
  if (settings.logo_url) data.logo = settings.logo_url;
  const sameAs = [settings.instagram_url, settings.facebook_url].filter(
    Boolean,
  );
  if (sameAs.length) data.sameAs = sameAs;
  return <JsonLd data={data} />;
}

export function ProductJsonLd({
  product,
  currency,
}: {
  product: Product;
  currency: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: `${siteUrl}/product/${product.slug}`,
  };
  if (product.short_description) data.description = product.short_description;
  if (product.images?.length) data.image = product.images.map((i) => i.url);
  // Offer only emitted when a real price exists — never invent one.
  if (product.price_cents !== null) {
    data.offers = {
      "@type": "Offer",
      price: (product.price_cents / 100).toFixed(2),
      priceCurrency: currency,
      availability: product.is_sold_out
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    };
  }
  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; href: string }[];
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${siteUrl}${item.href}`,
        })),
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  if (!items.length) return null;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }}
    />
  );
}
