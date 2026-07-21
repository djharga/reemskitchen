import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { getSettings } from "@/lib/queries";
import { DEFAULT_LOCALE, dirFor } from "@/lib/i18n/config";
import "./globals.css";

// Clean sans for body text; Fraunces gives headings a warm, homemade feel.
// Both keep excellent readability. For future Arabic support add:
//   const notoArabic = Noto_Naskh_Arabic({ subsets: ["arabic"], ... })
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

/** "#3e2f25" -> "62 47 37" (RGB channel triplet used by Tailwind tokens). */
function hexToRgbTriplet(hex: string): string | null {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title =
    settings.seo_title ??
    `${settings.store_name} | Handmade Middle Eastern Food in Calgary`;
  const description =
    settings.seo_description ??
    "Handmade Middle Eastern breads, savoury pastries, dips and sweets — made in small batches for Calgary farmers' markets.";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${settings.store_name}` },
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_CA",
      siteName: settings.store_name,
    },
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  // Brand color overrides from admin Settings (design tokens stay central).
  // Keys are token names like "cocoa-soft" (or already-prefixed "--rk-cocoa-soft").
  // Each hex override also updates its "-rgb" triplet so Tailwind opacity
  // modifiers (e.g. border-cocoa/20) follow the new color too.
  const overrides = Object.entries(settings.brand_colors ?? {})
    .filter(
      (entry): entry is [string, string] =>
        typeof entry[1] === "string" && entry[1].length > 0,
    )
    .flatMap(([key, hex]) => {
      const token = key.startsWith("--rk-") ? key : `--rk-${key}`;
      const rgb = hexToRgbTriplet(hex);
      return rgb
        ? [`${token}: ${hex};`, `${token}-rgb: ${rgb};`]
        : [`${token}: ${hex};`];
    })
    .join(" ");

  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={dirFor(DEFAULT_LOCALE)}
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body>
        {overrides ? <style>{`:root { ${overrides} }`}</style> : null}
        {children}
      </body>
    </html>
  );
}
