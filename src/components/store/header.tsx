"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import type { Category, SiteSettings } from "@/lib/types";
import { useCart } from "./cart/cart-provider";

/**
 * Simple, calm header: logo, primary nav (with dynamic category links),
 * search, account and cart. Mobile gets a clear slide-in side menu.
 */
export function Header({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: Category[];
}) {
  const cart = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  const catLinks = categories
    .filter((c) => c.slug !== "bundles")
    .map((c) => ({
      label: c.name.split(" & ")[0].replace("Fresh ", ""),
      href: `/shop?category=${c.slug}`,
    }));

  const nav = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    ...catLinks,
    { label: "Find Us", href: "/find-us" },
    { label: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-cream/95 backdrop-blur">
      <div className="container-rk flex h-16 items-center justify-between gap-3">
        {/* Mobile menu button */}
        <button
          className="btn-ghost !min-h-0 p-2 lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu size={22} aria-hidden />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={`${settings.store_name} home`}
        >
          {settings.logo_url ? (
            <Image
              src={settings.logo_url}
              alt=""
              width={36}
              height={36}
              className="rounded-full object-contain"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender text-sm font-bold text-white"
            >
              RK
            </span>
          )}
          <span className="font-display text-lg font-semibold leading-none">
            {settings.store_name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded px-3 py-2 text-sm font-medium hover:bg-cream-deep"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            className="btn-ghost !min-h-0 p-2"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search"
            aria-expanded={searchOpen}
          >
            <Search size={20} aria-hidden />
          </button>
          <Link
            href="/account"
            className="btn-ghost !min-h-0 hidden p-2 sm:inline-flex"
            aria-label="Account"
          >
            <User size={20} aria-hidden />
          </Link>
          <button
            className="btn-ghost !min-h-0 relative p-2"
            onClick={cart.openCart}
            aria-label={`Open cart, ${cart.itemCount} items`}
          >
            <ShoppingBag size={20} aria-hidden />
            {cart.itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-honey px-1 text-xs font-bold text-cocoa">
                {cart.itemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen ? (
        <div className="border-t border-cocoa/10 bg-white">
          <form
            onSubmit={submitSearch}
            className="container-rk flex gap-2 py-3"
            role="search"
          >
            <input
              autoFocus
              className="input"
              type="search"
              placeholder="Search naan, hummus, baklava…"
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>
      ) : null}

      {/* Mobile side menu */}
      {menuOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-cocoa/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-cream shadow-xl">
            <div className="flex items-center justify-between border-b border-cocoa/10 px-4 py-4">
              <span className="font-display font-semibold">
                {settings.store_name}
              </span>
              <button
                className="btn-ghost !min-h-0 p-2"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} aria-hidden />
              </button>
            </div>
            <nav
              className="flex flex-col gap-1 overflow-y-auto p-3"
              aria-label="Mobile"
            >
              {nav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded px-3 py-2.5 text-base font-medium hover:bg-cream-deep"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/account"
                className="rounded px-3 py-2.5 text-base font-medium hover:bg-cream-deep"
                onClick={() => setMenuOpen(false)}
              >
                Account
              </Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
