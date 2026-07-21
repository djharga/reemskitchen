"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import type { MarketSchedule } from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatTime,
} from "@/lib/utils";
import { useCart } from "./cart/cart-provider";
import { createOrder } from "@/app/actions/orders";
import { ProductThumb } from "./product-image";

/**
 * Checkout: contact info + pickup slot + payment method, validated with Zod
 * on the client and re-validated on the server inside createOrder.
 * Online payment is only offered when Stripe is genuinely configured.
 */
export function CheckoutForm({
  schedules,
  stripeEnabled,
  discountsEnabled,
}: {
  schedules: MarketSchedule[];
  stripeEnabled: boolean;
  discountsEnabled: boolean;
}) {
  const router = useRouter();
  const cart = useCart();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      notes: cart.orderNote || "",
      paymentMethod: "pay_at_pickup",
    },
  });

  if (cart.items.length === 0 && !submitting) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">
          Your cart is empty.
        </p>
        <p className="text-sm text-cocoa-soft">
          Add something delicious first.
        </p>
        <Link href="/shop" className="btn-primary mt-1">
          Browse the shop
        </Link>
      </div>
    );
  }

  async function onSubmit(values: CheckoutInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      const result = await createOrder({
        ...values,
        items: cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      });
      if (result.ok) {
        cart.clearCart();
        router.push(
          `/order/${result.orderNumber}?email=${encodeURIComponent(values.email)}`,
        );
      } else {
        setServerError(result.error);
        setSubmitting(false);
      }
    } catch {
      setServerError(
        "Something went wrong while placing your order. Please try again.",
      );
      setSubmitting(false);
    }
  }

  const selectedScheduleId = undefined; // schedule details rendered per-option below

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-8 lg:grid-cols-[1fr_380px]"
      noValidate
    >
      <div className="flex flex-col gap-6">
        {/* Contact */}
        <section className="card p-5" aria-labelledby="contact-h">
          <h2
            id="contact-h"
            className="mb-4 font-display text-lg font-semibold"
          >
            Your details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="co-name" className="label">
                Full name
              </label>
              <input
                id="co-name"
                className="input"
                autoComplete="name"
                {...register("name")}
              />
              {errors.name ? (
                <p role="alert" className="mt-1 text-sm text-terracotta">
                  {errors.name.message}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="co-email" className="label">
                Email
              </label>
              <input
                id="co-email"
                type="email"
                className="input"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email ? (
                <p role="alert" className="mt-1 text-sm text-terracotta">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="co-phone" className="label">
                Phone
              </label>
              <input
                id="co-phone"
                type="tel"
                className="input"
                autoComplete="tel"
                {...register("phone")}
              />
              {errors.phone ? (
                <p role="alert" className="mt-1 text-sm text-terracotta">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Pickup */}
        <section className="card p-5" aria-labelledby="pickup-h">
          <h2 id="pickup-h" className="mb-1 font-display text-lg font-semibold">
            Pickup location & time
          </h2>
          <p className="mb-4 text-sm text-cocoa-soft">
            Choose the market where you&apos;ll pick up your order.
          </p>
          {schedules.length === 0 ? (
            <p className="rounded bg-cream-deep px-4 py-3 text-sm">
              Pre-orders are paused right now — our next market date will be
              announced soon.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {schedules.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-cocoa/15 bg-white p-4 transition-colors has-[:checked]:border-lavender-deep has-[:checked]:ring-1 has-[:checked]:ring-lavender-deep"
                >
                  <input
                    type="radio"
                    value={s.id}
                    className="mt-1"
                    {...register("scheduleId")}
                  />
                  <span>
                    <span className="block font-semibold">
                      {s.location?.name}
                    </span>
                    <span className="block text-sm text-cocoa-soft">
                      {formatDate(s.market_date)} · {formatTime(s.start_time)}–
                      {formatTime(s.end_time)}
                    </span>
                    {s.location?.address ? (
                      <span className="block text-sm text-cocoa-soft">
                        {s.location.address}
                      </span>
                    ) : null}
                    {s.location?.pickup_instructions ? (
                      <span className="mt-1 block text-xs text-cocoa-soft">
                        {s.location.pickup_instructions}
                      </span>
                    ) : null}
                    {s.preorder_deadline ? (
                      <span className="mt-1 block text-xs font-medium text-terracotta">
                        Order by {formatDateTime(s.preorder_deadline)}
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
              {errors.scheduleId ? (
                <p role="alert" className="text-sm text-terracotta">
                  Please choose a pickup location and date.
                </p>
              ) : null}
            </div>
          )}
        </section>

        {/* Notes + discount */}
        <section className="card p-5" aria-labelledby="notes-h">
          <h2 id="notes-h" className="mb-4 font-display text-lg font-semibold">
            Notes
          </h2>
          <label htmlFor="co-note" className="label">
            Anything we should know? (optional)
          </label>
          <textarea
            id="co-note"
            rows={3}
            className="input"
            placeholder="Allergies, pickup timing, special requests…"
            {...register("notes")}
          />
          {discountsEnabled ? (
            <div className="mt-4">
              <label htmlFor="co-discount" className="label">
                Discount code (optional)
              </label>
              <input
                id="co-discount"
                className="input sm:max-w-xs"
                autoComplete="off"
                {...register("discountCode")}
              />
            </div>
          ) : null}
        </section>

        {/* Payment */}
        <section className="card p-5" aria-labelledby="payment-h">
          <h2
            id="payment-h"
            className="mb-4 font-display text-lg font-semibold"
          >
            Payment
          </h2>
          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-cocoa/15 bg-white p-4 has-[:checked]:border-lavender-deep has-[:checked]:ring-1 has-[:checked]:ring-lavender-deep">
              <input
                type="radio"
                value="pay_at_pickup"
                className="mt-1"
                {...register("paymentMethod")}
              />
              <span>
                <span className="block font-semibold">Pay at pickup</span>
                <span className="block text-sm text-cocoa-soft">
                  Pay by card or cash at our market stall when you collect your
                  order.
                </span>
              </span>
            </label>
            {stripeEnabled ? (
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-cocoa/15 bg-white p-4 has-[:checked]:border-lavender-deep has-[:checked]:ring-1 has-[:checked]:ring-lavender-deep">
                <input
                  type="radio"
                  value="stripe"
                  className="mt-1"
                  {...register("paymentMethod")}
                />
                <span>
                  <span className="block font-semibold">Pay online</span>
                  <span className="block text-sm text-cocoa-soft">
                    Secure card payment powered by Stripe.
                  </span>
                </span>
              </label>
            ) : null}
          </div>
        </section>
      </div>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <section className="card p-5" aria-labelledby="summary-h">
          <h2
            id="summary-h"
            className="mb-4 font-display text-lg font-semibold"
          >
            Order summary
          </h2>
          <ul className="flex flex-col gap-3">
            {cart.items.map((item) => (
              <li key={`${item.productId}-${item.variantId ?? "base"}`} className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded">
                  <ProductThumb name={item.name} imageUrl={item.imageUrl} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-cocoa-soft">
                    {item.variantName ? `${item.variantName} · ` : ""}Qty{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {item.priceCents !== null
                    ? formatPrice(item.priceCents * item.quantity)
                    : "TBD"}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-cocoa/10 pt-3">
            <div className="flex items-baseline justify-between">
              <p className="font-semibold">Total</p>
              <p className="text-lg font-semibold">
                {formatPrice(cart.subtotalCents)}
              </p>
            </div>
            {cart.hasUnpricedItems ? (
              <p className="mt-1 text-xs text-cocoa-soft">
                Some items don&apos;t have a confirmed price yet — we&apos;ll
                confirm the final total before pickup.
              </p>
            ) : null}
          </div>
          {serverError ? (
            <p
              role="alert"
              className="mt-3 rounded bg-terracotta-soft px-3 py-2 text-sm font-medium text-terracotta"
            >
              {serverError}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn-primary mt-4 w-full"
            disabled={submitting || schedules.length === 0}
          >
            {submitting ? "Placing your order…" : "Place pre-order"}
          </button>
          <p className="mt-2 text-center text-xs text-cocoa-soft">
            No payment is taken online unless you choose to pay online.
          </p>
        </section>
      </aside>
    </form>
  );
}
