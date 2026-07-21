"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "./product-image";
import { AddToCartButton } from "./add-to-cart-button";

/** Lightweight quick-view dialog with variant + quantity selection. */
export function QuickView({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState<string | null>(
    variants.find((v) => v.is_default)?.id ?? variants[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const selected = variants.find((v) => v.id === variantId) ?? null;
  const image = product.images?.[0];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${product.name}`}
    >
      <button
        aria-label="Close quick view"
        className="absolute inset-0 bg-cocoa/40"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-lg bg-cream p-5 sm:rounded-lg sm:p-6">
        <button
          className="absolute right-3 top-3 rounded-full bg-white p-2"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} aria-hidden />
        </button>
        <div className="grid gap-5 sm:grid-cols-2">
          <ProductImage
            name={product.name}
            categoryName={product.category?.name}
            imageUrl={image?.url}
            alt={image?.alt_text}
            sizes="(max-width: 640px) 90vw, 320px"
          />
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1">
              {product.is_vegan ? (
                <span className="badge-vegan">Vegan</span>
              ) : product.is_vegetarian ? (
                <span className="badge-vegetarian">Vegetarian</span>
              ) : null}
              {product.is_sold_out ? (
                <span className="badge-soldout">Sold Out</span>
              ) : null}
            </div>
            <h2 className="font-display text-xl font-semibold">
              {product.name}
            </h2>
            {product.short_description ? (
              <p className="text-sm text-cocoa-soft">
                {product.short_description}
              </p>
            ) : null}
            <p className="text-base font-semibold">
              {formatPrice(
                selected ? selected.price_cents : product.price_cents,
                {
                  nullLabel: "Price coming soon",
                },
              )}
            </p>

            {variants.length > 0 ? (
              <fieldset>
                <legend className="label">Size / option</legend>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={v.is_sold_out}
                      onClick={() => setVariantId(v.id)}
                      className={`rounded border px-3 py-2 text-sm disabled:opacity-40 ${
                        variantId === v.id
                          ? "border-lavender-deep bg-white font-semibold"
                          : "border-cocoa/20 bg-white"
                      }`}
                      aria-pressed={variantId === v.id}
                    >
                      {v.name}
                      {v.is_sold_out ? " (sold out)" : ""}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="flex items-center gap-3">
              <label
                htmlFor={`qv-qty-${product.id}`}
                className="text-sm font-medium"
              >
                Quantity
              </label>
              <select
                id={`qv-qty-${product.id}`}
                className="input !w-20"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <AddToCartButton
              product={product}
              variant={selected}
              quantity={quantity}
            />
            <Link
              href={`/product/${product.slug}`}
              className="text-center text-sm font-medium text-lavender-deep underline"
              onClick={onClose}
            >
              View full details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
