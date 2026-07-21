/**
 * i18n scaffolding.
 *
 * The site ships English-only. Arabic (RTL) and French are prepared but
 * NOT exposed until real translations are added:
 * 1. Create src/lib/i18n/ar.ts (and/or fr.ts) mirroring en.ts.
 * 2. Add the locale to ACTIVE_LOCALES below.
 * 3. The language switcher (hidden while only one locale is active)
 *    appears automatically, and dir="rtl" is applied for Arabic.
 */
export const ALL_LOCALES = ["en", "ar", "fr"] as const;
export type Locale = (typeof ALL_LOCALES)[number];

/** Only locales with complete, human-reviewed translations. */
export const ACTIVE_LOCALES: Locale[] = ["en"];

export const DEFAULT_LOCALE: Locale = "en";

export const RTL_LOCALES: Locale[] = ["ar"];

export function dirFor(locale: Locale): "ltr" | "rtl" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
