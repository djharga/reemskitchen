"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { ProductImage } from "./product-image";
import { QuickView } from "./quick-view";
import { AddToCartButton } from "./add-to-cart-button";

/**
 * Product card used in grids. CRO details:
 * - whole image + title clickable
 * - badges for dietary + availability at a glance
 * - one-tap Add to Cart (or size picker via Quick View when variants exist)
 */
export function ProductCard({ product }: { product: Product }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const image = product.images?.[0];

  return (
    <article className="card group relative flex flex-col overflow-hidden">
      <Link href={`/product/${product.slug}`} className="relative block">
        <ProductImage
          name={product.name}
          categoryName={product.category?.name}
          imageUrl={image?.url}
          alt={image?.alt_text}
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {product.is_vegan ? (
            <span className="badge-vegan">Vegan</span>
          ) : product.is_vegetarian ? (
            <span className="badge-vegetarian">Vegetarian</span>
          ) : null}
          {product.is_sold_out ? (
            <span className="badge-soldout">Sold Out</span>
          ) : product.available_this_week ? (
            <span className="badge-available">Available this week</span>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => setQuickViewOpen(true)}
        className="absolute right-2 top-2 rounded-full border border-cocoa/10 bg-white/90 p-2 text-cocoa opacity-100 transition-opacity hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        aria-label={`Quick view: ${product.name}`}
      >
        <Eye size={16} aria-hidden />
      </button>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="font-display text-base font-semibold leading-snug">
          <Link href={`/product/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        {product.short_description ? (
          <p className="line-clamp-2 text-sm text-cocoa-soft">
            {product.short_description}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-sm font-semibold">
              {formatPrice(product.price_cents, {
                nullLabel: "Price coming soon",
              })}
            </p>
            {product.compare_at_price_cents !== null &&
            product.price_cents !== null ? (
              <p className="text-xs text-cocoa-soft line-through">
                {formatPrice(product.compare_at_price_cents)}
              </p>
            ) : null}
          </div>
          {hasVariants ? (
            <button
              type="button"
              className="btn-secondary !min-h-[38px] !px-3 text-xs"
              onClick={() => setQuickViewOpen(true)}
            >
              Choose size
            </button>
          ) : (
            <AddToCartButton product={product} compact />
          )}
        </div>
      </div>

      {quickViewOpen ? (
        <QuickView product={product} onClose={() => setQuickViewOpen(false)} />
      ) : null}
    </article>
  );
}
