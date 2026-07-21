import type { Config } from "tailwindcss";

/**
 * Brand colors are defined once as CSS variables (design tokens) in
 * src/app/globals.css and can also be overridden at runtime from the
 * admin Settings page (Settings -> Brand colors), which injects the
 * variables on <html>. Never hard-code hex values in components.
 *
 * Colors reference the `--rk-*-rgb` channel triplets (e.g. "62 47 37")
 * so Tailwind opacity modifiers like `border-cocoa/20` keep working.
 */
function token(name: string): string {
  return `rgb(var(--rk-${name}-rgb) / <alpha-value>)`;
}

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lavender: token("lavender"),
        "lavender-deep": token("lavender-deep"),
        cream: token("cream"),
        "cream-deep": token("cream-deep"),
        honey: token("honey"),
        "honey-deep": token("honey-deep"),
        olive: token("olive"),
        "olive-soft": token("olive-soft"),
        terracotta: token("terracotta"),
        "terracotta-soft": token("terracotta-soft"),
        cocoa: token("cocoa"),
        "cocoa-soft": token("cocoa-soft"),
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
