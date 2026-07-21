"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/lib/types";

const ALLERGENS = ["gluten", "dairy", "nuts", "sesame", "eggs"];

/**
 * Filter + sort bar for the shop. Every choice is written to the URL so
 * filtered views are shareable and survive refreshes.
 */
export function ShopFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState(params.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    startTransition(() =>
      router.replace(`/shop?${next.toString()}`, { scroll: false }),
    );
  }

  // Instant search with a small debounce
  useEffect(() => {
    if (search === (params.get("q") ?? "")) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setParam("q", search.trim() || null),
      350,
    );
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggles: Array<{ key: string; label: string }> = [
    { key: "vegan", label: "Vegan" },
    { key: "vegetarian", label: "Vegetarian" },
    { key: "instock", label: "In stock" },
    { key: "available", label: "Available this week" },
  ];

  const activeCount =
    toggles.filter((t) => params.get(t.key) === "1").length +
    (params.get("category") ? 1 : 0) +
    (params.get("pricemin") ? 1 : 0) +
    (params.get("pricemax") ? 1 : 0) +
    (params.get("spice") ? 1 : 0) +
    (params.get("noallergens") ? 1 : 0) +
    (params.get("tag") ? 1 : 0);

  function clearAll() {
    setSearch("");
    startTransition(() => router.replace("/shop", { scroll: false }));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search + sort row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="shop-search" className="sr-only">
          Search products
        </label>
        <input
          id="shop-search"
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-1 items-center justify-between gap-2">
          <button
            type="button"
            className="btn-secondary !min-h-[42px]"
            onClick={() => setPanelOpen((v) => !v)}
            aria-expanded={panelOpen}
          >
            <SlidersHorizontal size={16} aria-hidden />
            Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
          <div className="flex items-center gap-2">
            <label htmlFor="shop-sort" className="text-sm text-cocoa-soft">
              Sort
            </label>
            <select
              id="shop-sort"
              className="input !w-auto"
              value={params.get("sort") ?? "newest"}
              onChange={(e) =>
                setParam(
                  "sort",
                  e.target.value === "newest" ? null : e.target.value,
                )
              }
            >
              <option value="newest">Newest</option>
              <option value="best_selling">Best selling</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by category"
      >
        <button
          type="button"
          className={`rounded-full border px-3.5 py-1.5 text-sm ${!params.get("category") ? "border-lavender-deep bg-lavender-deep text-white" : "border-cocoa/20 bg-white"}`}
          onClick={() => setParam("category", null)}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`rounded-full border px-3.5 py-1.5 text-sm ${params.get("category") === c.slug ? "border-lavender-deep bg-lavender-deep text-white" : "border-cocoa/20 bg-white"}`}
            onClick={() =>
              setParam(
                "category",
                params.get("category") === c.slug ? null : c.slug,
              )
            }
            aria-pressed={params.get("category") === c.slug}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Expanded filter panel */}
      {panelOpen ? (
        <div className="card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <fieldset>
            <legend className="label">Dietary & availability</legend>
            <div className="flex flex-col gap-2">
              {toggles.map((t) => (
                <label key={t.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={params.get(t.key) === "1"}
                    onChange={(e) =>
                      setParam(t.key, e.target.checked ? "1" : null)
                    }
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="label">Price (CAD)</legend>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="price-min">
                Minimum price
              </label>
              <input
                id="price-min"
                type="number"
                min={0}
                placeholder="Min"
                className="input"
                defaultValue={params.get("pricemin") ?? ""}
                onBlur={(e) => setParam("pricemin", e.target.value || null)}
              />
              <span aria-hidden>–</span>
              <label className="sr-only" htmlFor="price-max">
                Maximum price
              </label>
              <input
                id="price-max"
                type="number"
                min={0}
                placeholder="Max"
                className="input"
                defaultValue={params.get("pricemax") ?? ""}
                onBlur={(e) => setParam("pricemax", e.target.value || null)}
              />
            </div>
            <p className="mt-1 text-xs text-cocoa-soft">
              Items without a price yet are always shown.
            </p>
          </fieldset>

          <fieldset>
            <legend className="label">Spice level (max)</legend>
            <select
              className="input"
              value={params.get("spice") ?? ""}
              onChange={(e) => setParam("spice", e.target.value || null)}
              aria-label="Maximum spice level"
            >
              <option value="">Any</option>
              <option value="0">Not spicy</option>
              <option value="1">Mild</option>
              <option value="2">Medium</option>
              <option value="3">Hot</option>
            </select>
          </fieldset>

          <fieldset>
            <legend className="label">Without allergens</legend>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((a) => {
                const selected = (params.get("noallergens") ?? "")
                  .split(",")
                  .filter(Boolean);
                const isOn = selected.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={isOn}
                    className={`rounded-full border px-3 py-1 text-xs capitalize ${isOn ? "border-olive bg-olive text-white" : "border-cocoa/20 bg-white"}`}
                    onClick={() => {
                      const next = isOn
                        ? selected.filter((x) => x !== a)
                        : [...selected, a];
                      setParam(
                        "noallergens",
                        next.length ? next.join(",") : null,
                      );
                    }}
                  >
                    {a}-free
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      ) : null}

      {activeCount > 0 || params.get("q") ? (
        <div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-terracotta underline"
            onClick={clearAll}
          >
            <X size={14} aria-hidden /> Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
