import type { Config } from "tailwindcss";

/**
 * Brand colors are defined once as CSS variables (design tokens) in
 * src/app/globals.css and can also be overridden at runtime from the
 * admin Settings page (Settings -> Brand colors), which injects the
 * variables on <html>. Never hard-code hex values in components.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lavender: "var(--rk-lavender)",
        "lavender-deep": "var(--rk-lavender-deep)",
        cream: "var(--rk-cream)",
        "cream-deep": "var(--rk-cream-deep)",
        honey: "var(--rk-honey)",
        "honey-deep": "var(--rk-honey-deep)",
        olive: "var(--rk-olive)",
        "olive-soft": "var(--rk-olive-soft)",
        terracotta: "var(--rk-terracotta)",
        "terracotta-soft": "var(--rk-terracotta-soft)",
        cocoa: "var(--rk-cocoa)",
        "cocoa-soft": "var(--rk-cocoa-soft)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(62,47,37,.05), 0 4px 12px rgba(62,47,37,.05)",
      },
      aspectRatio: {
        product: "1 / 1",
      },
    },
  },
  plugins: [],
};

export default config;
