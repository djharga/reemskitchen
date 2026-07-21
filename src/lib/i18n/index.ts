import en, { type Dictionary } from "./en";
import { DEFAULT_LOCALE, type Locale } from "./config";

const dictionaries: Partial<Record<Locale, Dictionary>> = {
  en,
  // ar: (await import('./ar')).default  — add when real translations exist
  // fr: (await import('./fr')).default
};

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return dictionaries[locale] ?? en;
}
