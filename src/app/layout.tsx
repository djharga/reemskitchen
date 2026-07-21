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
  // Brand color overrides from admin Settings (design tokens stay central)
  const overrides = Object.entries(settings.brand_colors ?? {})
    .filter(([k, v]) => k.startsWith("--rk-") && typeof v === "string")
    .map(([k, v]) => `${k}: ${v};`)
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
