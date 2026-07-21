import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatTime,
} from "@/lib/utils";
import {
  OrderAdminNote,
  OrderStatusSelect,
  PrintButton,
} from "@/components/admin/order-actions";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "*, items:order_items(*), schedule:market_schedules(market_date, start_time, end_time, location:locations(name, address, pickup_instructions))",
    )
    .eq("id", params.id)
    .single();
  if (!order) notFound();

  const schedule = Array.isArray(order.schedule)
    ? order.schedule[0]
    : order.schedule;
  const location = Array.isArray(schedule?.location)
    ? schedule?.location[0]
    : schedule?.location;

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-lavender-deep underline"
          >
            ← Back to orders
          </Link>
          <h1 className="mt-1 font-display text-2xl font-semibold">
            Order {order.order_number}
          </h1>
          <p className="text-sm text-cocoa-soft">
            Placed {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusSelect orderId={order.id} status={order.status} />
          <PrintButton />
        </div>
      </div>

      {/* Printable summary */}
      <div className="card p-5">
        <div className="hidden print:block">
          <h1 className="font-display text-xl font-semibold">
            Reem&apos;s Kitchen — Order {order.order_number}
          </h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="mb-1 font-semibold">Customer</h2>
            <p className="text-sm">{order.customer_name}</p>
            <p className="text-sm text-cocoa-soft">{order.customer_email}</p>
            <p className="text-sm text-cocoa-soft">{order.customer_phone}</p>
          </div>
          <div>
            <h2 className="mb-1 font-semibold">Pickup</h2>
            {schedule ? (
              <>
                <p className="text-sm">
                  {formatDate(schedule.market_date)} ·{" "}
                  {formatTime(schedule.start_time)}–
                  {formatTime(schedule.end_time)}
                </p>
                <p className="text-sm text-cocoa-soft">
                  {location?.name}
                  {location?.address ? ` — ${location.address}` : ""}
                </p>
              </>
            ) : (
              <p className="text-sm text-cocoa-soft">
                No pickup slot recorded.
              </p>
            )}
          </div>
        </div>

        <h2 className="mb-2 mt-5 font-semibold">Items</h2>
        <ul className="divide-y divide-cocoa/10 rounded border border-cocoa/10">
          {(order.items ?? []).map(
            (item: {
              id: string;
              product_name: string;
              variant_name: string | null;
              quantity: number;
              unit_price_cents: number | null;
            }) => (
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
                    : "Price at pickup"}
                </span>
              </li>
            ),
          )}
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
            Discount ({order.discount_code ?? "code"}): −
            {formatPrice(order.discount_cents)}
          </p>
        ) : null}
        <p className="mt-2 px-1 text-sm text-cocoa-soft">
          Payment:{" "}
          {order.payment_method === "stripe"
            ? "Online (Stripe)"
            : "Pay at pickup"}{" "}
          · <span className="capitalize">{order.payment_status}</span>
        </p>
        {order.customer_note ? (
          <div className="mt-4 rounded bg-cream-deep px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cocoa-soft">
              Customer note
            </p>
            <p className="mt-1 text-sm">{order.customer_note}</p>
          </div>
        ) : null}
      </div>

      <div className="card p-5 print:hidden">
        <OrderAdminNote orderId={order.id} note={order.admin_note} />
      </div>
    </div>
  );
}
