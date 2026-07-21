import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { getOrderForConfirmation } from "@/app/actions/orders";
import { formatDate, formatPrice, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false },
};

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { email?: string };
}) {
  const email = searchParams.email;
  if (!email) notFound();

  const order = await getOrderForConfirmation(params.orderNumber, email);
  if (!order) notFound();

  const schedule = order.schedule;

  return (
    <div className="container-rk max-w-2xl py-12 sm:py-16">
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 size={44} className="text-olive" aria-hidden />
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            Thank you — your pre-order is in!
          </h1>
          <p className="text-cocoa-soft">
            Order number{" "}
            <span className="rounded bg-cream-deep px-2 py-0.5 font-mono font-semibold text-cocoa">
              {order.order_number}
            </span>
          </p>
          <p className="text-sm text-cocoa-soft">
            A confirmation was recorded for {order.customer_email}. Please keep
            your order number handy at pickup.
          </p>
        </div>

        {schedule ? (
          <div className="mt-6 rounded-lg bg-cream-deep p-4">
            <h2 className="mb-2 font-semibold">Pickup details</h2>
            <p className="flex items-center gap-1.5 text-sm">
              <MapPin size={14} aria-hidden />
              {schedule.location?.name}
              {schedule.location?.address
                ? ` — ${schedule.location.address}`
                : ""}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <Clock size={14} aria-hidden />
              {formatDate(schedule.market_date)} ·{" "}
              {formatTime(schedule.start_time)}–{formatTime(schedule.end_time)}
            </p>
            {schedule.location?.pickup_instructions ? (
              <p className="mt-2 text-sm text-cocoa-soft">
                {schedule.location.pickup_instructions}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6">
          <h2 className="mb-2 font-semibold">Your items</h2>
          <ul className="divide-y divide-cocoa/10 rounded-lg border border-cocoa/10">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-baseline justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <span>
                  {item.product_name}
                  {item.variant_name ? ` · ${item.variant_name}` : ""}
                  <span className="text-cocoa-soft"> × {item.quantity}</span>
                </span>
                <span className="font-medium">
                  {item.unit_price_cents !== null
                    ? formatPrice(item.unit_price_cents * item.quantity)
                    : "Price confirmed at pickup"}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between px-1">
            <p className="font-semibold">Total</p>
            <p className="font-semibold">
              {formatPrice(order.total_cents)}
              {order.has_unpriced_items ? " + items priced at pickup" : ""}
            </p>
          </div>
          {order.discount_cents ? (
            <p className="mt-1 px-1 text-sm text-olive">
              Discount applied: −{formatPrice(order.discount_cents)}
            </p>
          ) : null}
          <p className="mt-2 px-1 text-sm text-cocoa-soft">
            Payment:{" "}
            {order.payment_method === "stripe"
              ? "Paid online"
              : "Pay at pickup (card or cash)"}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">
            Keep shopping
          </Link>
          <Link href="/find-us" className="btn-secondary">
            Market details
          </Link>
        </div>
      </div>
    </div>
  );
}
