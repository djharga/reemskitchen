"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart-button";

/**
 * Purchase panel: variant selection, quantity, add-to-cart.
 * "Buy Now" appears ONLY when online payment (Stripe) is actually
 * enabled and configured — no fake payment buttons.
 */
export function ProductPurchase({
  product,
  stripeEnabled,
}: {
  product: Product;
  stripeEnabled: boolean;
}) {
  const variants = product.variants ?? [];
  const [variantId, setVariantId] = useState<string | null>(
    variants.find((v) => v.is_default)?.id ?? variants[0]?.id ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const selected = variants.find((v) => v.id === variantId) ?? null;
  const priceCents = selected ? selected.price_cents : product.price_cents;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <p className="text-2xl font-semibold">
          {formatPrice(priceCents, { nullLabel: "Price coming soon" })}
        </p>
        {product.compare_at_price_cents !== null && priceCents !== null ? (
          <p className="text-base text-cocoa-soft line-through">
            {formatPrice(product.compare_at_price_cents)}
          </p>
        ) : null}
      </div>
      {priceCents === null ? (
        <p className="-mt-3 text-sm text-cocoa-soft">
          You can still pre-order — we&apos;ll confirm the price before pickup.
        </p>
      ) : null}

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
                aria-pressed={variantId === v.id}
                className={`rounded border px-4 py-2.5 text-sm disabled:opacity-40 ${
                  variantId === v.id
                    ? "border-lavender-deep bg-white font-semibold"
                    : "border-cocoa/20 bg-white"
                }`}
              >
                {v.name}
                {v.price_cents !== null
                  ? ` · ${formatPrice(v.price_cents)}`
                  : ""}
                {v.is_sold_out ? " (sold out)" : ""}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex items-center gap-3">
        <label htmlFor="pdp-qty" className="text-sm font-medium">
          Quantity
        </label>
        <div className="flex items-center rounded border border-cocoa/20 bg-white">
          <button
            type="button"
            className="px-3.5 py-2.5 text-lg leading-none"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <output
            id="pdp-qty"
            className="min-w-[2.5ch] text-center text-sm font-semibold"
            aria-live="polite"
          >
            {quantity}
          </output>
          <button
            type="button"
            className="px-3.5 py-2.5 text-lg leading-none"
            onClick={() => setQuantity((q) => Math.min(50, q + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <AddToCartButton
        product={product}
        variant={selected}
        quantity={quantity}
      />
      {stripeEnabled ? (
        <p className="text-xs text-cocoa-soft">
          Pay online or at pickup — your choice at checkout.
        </p>
      ) : (
        <p className="text-xs text-cocoa-soft">
          Pre-order now, pay at pickup (card or cash at our market stall).
        </p>
      )}
    </div>
  );
}
