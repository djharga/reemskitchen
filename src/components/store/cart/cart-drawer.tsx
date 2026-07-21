"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./cart-provider";
import { ProductThumb } from "@/components/store/product-image";
import { formatPrice } from "@/lib/utils";

/** Slide-in cart drawer. Rendered once in the store layout. */
export function CartDrawer() {
  const cart = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape; trap initial focus for accessibility
  useEffect(() => {
    if (!cart.isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cart.closeCart();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cart.isOpen, cart]);

  if (!cart.isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      <button
        aria-label="Close cart"
        className="absolute inset-0 bg-cocoa/40"
        onClick={cart.closeCart}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-cocoa/10 px-5 py-4">
          <h2 className="font-display text-lg font-semibold">
            Your Cart{cart.itemCount > 0 ? ` (${cart.itemCount})` : ""}
          </h2>
          <button
            className="btn-ghost !min-h-0 p-2"
            onClick={cart.closeCart}
            aria-label="Close cart"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="text-cocoa-soft" size="40" aria-hidden />
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-cocoa-soft">
              Fresh breads, dips and sweets are waiting in the shop.
            </p>
            <Link
              href="/shop"
              className="btn-primary mt-2"
              onClick={cart.closeCart}
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-cocoa/10 overflow-y-auto px-5">
              {cart.items.map((item) => (
                <li
                  key={`${item.productId}-${item.variantId ?? "base"}`}
                  className="flex gap-3 py-4"
                >
                  <div className="h-16 w-16 shrink-0">
                    <ProductThumb name={item.name} imageUrl={item.imageUrl} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={cart.closeCart}
                      className="block truncate text-sm font-semibold hover:underline"
                    >
                      {item.name}
                    </Link>
                    {item.variantName ? (
                      <p className="text-xs text-cocoa-soft">
                        {item.variantName}
                      </p>
                    ) : null}
                    <p className="mt-0.5 text-sm text-cocoa-soft">
                      {formatPrice(item.priceCents, {
                        nullLabel: "Price confirmed at pickup",
                      })}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded border border-cocoa/20 bg-white">
                        <button
                          className="px-2.5 py-1.5"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() =>
                            cart.updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity - 1,
                            )
                          }
                        >
                          <Minus size={14} aria-hidden />
                        </button>
                        <span
                          className="min-w-[2ch] text-center text-sm"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          className="px-2.5 py-1.5"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() =>
                            cart.updateQuantity(
                              item.productId,
                              item.variantId,
                              item.quantity + 1,
                            )
                          }
                        >
                          <Plus size={14} aria-hidden />
                        </button>
                      </div>
                      <button
                        className="p-1.5 text-cocoa-soft hover:text-terracotta"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() =>
                          cart.removeItem(item.productId, item.variantId)
                        }
                      >
                        <Trash2 size={16} aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-cocoa/10 bg-white px-5 py-4">
              <label htmlFor="cart-note" className="label">
                Order note (optional)
              </label>
              <textarea
                id="cart-note"
                className="input mb-3 h-16 resize-none"
                placeholder="Anything we should know?"
                value={cart.orderNote}
                onChange={(e) => cart.setOrderNote(e.target.value)}
              />
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">Subtotal</span>
                <span className="font-semibold">
                  {formatPrice(cart.subtotalCents)}
                </span>
              </div>
              {cart.hasUnpricedItems ? (
                <p className="mb-2 text-xs text-cocoa-soft">
                  Some prices will be confirmed before pickup.
                </p>
              ) : null}
              <p className="mb-3 text-xs text-cocoa-soft">
                Pickup location and time are chosen at checkout.
              </p>
              <Link
                href="/checkout"
                className="btn-primary w-full"
                onClick={cart.closeCart}
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
