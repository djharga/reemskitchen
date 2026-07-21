"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/types";
import { useCart } from "./cart/cart-provider";

export function AddToCartButton({
  product,
  variant = null,
  quantity = 1,
  compact = false,
  className,
}: {
  product: Product;
  variant?: ProductVariant | null;
  quantity?: number;
  compact?: boolean;
  className?: string;
}) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.is_sold_out || (variant?.is_sold_out ?? false);

  function handleAdd() {
    cart.addItem(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        slug: product.slug,
        name: product.name,
        variantName: variant?.name ?? null,
        priceCents: variant ? variant.price_cents : product.price_cents,
        imageUrl: product.images?.[0]?.url ?? null,
      },
      quantity,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  if (soldOut) {
    return (
      <button
        type="button"
        className={`btn-secondary ${compact ? "!min-h-[38px] !px-3 text-xs" : "w-full"}`}
        disabled
      >
        Sold Out
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={
        className ??
        `btn-primary ${compact ? "!min-h-[38px] !px-3 text-xs" : "w-full"}`
      }
      aria-label={`Add ${product.name} to cart`}
    >
      {added ? (
        <Check size={compact ? 14 : 18} aria-hidden />
      ) : (
        <ShoppingBag size={compact ? 14 : 18} aria-hidden />
      )}
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
