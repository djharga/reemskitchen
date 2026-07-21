"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { isPreorderOpen } from "@/lib/utils";
import type {
  DiscountCode,
  Location,
  MarketSchedule,
  Order,
  OrderItem,
} from "@/lib/types";

export type CreateOrderResult =
  { ok: true; orderNumber: string } | { ok: false; error: string };

/**
 * Creates a REAL order. All prices, availability and pickup windows are
 * re-verified server-side from the database — nothing from the client
 * cart is trusted except product/variant ids and quantities.
 */
export async function createOrder(
  input: CheckoutInput,
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid order.",
    };
  }
  const data = parsed.data;
  const supabase = createAdminClient();

  // 1. Pickup schedule must exist, be published and still open for pre-orders
  const { data: schedule } = await supabase
    .from("market_schedules")
    .select("*, location:locations(*)")
    .eq("id", data.scheduleId)
    .eq("is_published", true)
    .maybeSingle();
  if (!schedule)
    return { ok: false, error: "That pickup date is no longer available." };
  if (!isPreorderOpen(schedule)) {
    return { ok: false, error: "Pre-orders for that market day have closed." };
  }
  if (schedule.max_orders) {
    const { count } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("schedule_id", schedule.id)
      .neq("status", "cancelled");
    if ((count ?? 0) >= schedule.max_orders) {
      return {
        ok: false,
        error: "That market day is fully booked. Please pick another date.",
      };
    }
  }

  // 2. Load products & variants fresh from the database
  const productIds = Array.from(new Set(data.items.map((i) => i.productId)));
  const { data: products } = await supabase
    .from("products")
    .select("*, variants:product_variants(*)")
    .in("id", productIds)
    .eq("is_published", true);

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  let subtotal = 0;
  let hasUnpriced = false;
  const orderItems: Array<{
    product_id: string;
    variant_id: string | null;
    product_name: string;
    variant_name: string | null;
    unit_price_cents: number | null;
    quantity: number;
    line_total_cents: number | null;
  }> = [];

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product)
      return {
        ok: false,
        error: "An item in your cart is no longer available.",
      };
    if (product.is_sold_out) {
      return {
        ok: false,
        error: `"${product.name}" is sold out. Please remove it from your cart.`,
      };
    }
    let variant = null;
    if (item.variantId) {
      variant = (product.variants ?? []).find(
        (v: { id: string }) => v.id === item.variantId,
      );
      if (!variant)
        return {
          ok: false,
          error: "A selected option is no longer available.",
        };
      if (variant.is_sold_out) {
        return {
          ok: false,
          error: `"${product.name} — ${variant.name}" is sold out.`,
        };
      }
    }
    const unitPrice: number | null = variant
      ? variant.price_cents
      : product.price_cents;
    const lineTotal = unitPrice === null ? null : unitPrice * item.quantity;
    if (unitPrice === null) hasUnpriced = true;
    else subtotal += lineTotal!;

    orderItems.push({
      product_id: product.id,
      variant_id: variant?.id ?? null,
      product_name: product.name,
      variant_name: variant?.name ?? null,
      unit_price_cents: unitPrice,
      quantity: item.quantity,
      line_total_cents: lineTotal,
    });
  }

  // 3. Discount code (optional)
  let discountCents = 0;
  let appliedCode: string | null = null;
  if (data.discountCode) {
    const { data: code } = await supabase
      .from("discount_codes")
      .select("*")
      .ilike("code", data.discountCode)
      .eq("is_active", true)
      .maybeSingle<DiscountCode>();
    const now = new Date();
    const valid =
      code &&
      (!code.starts_at || new Date(code.starts_at) <= now) &&
      (!code.ends_at || new Date(code.ends_at) >= now) &&
      (code.max_uses === null || code.used_count < code.max_uses);
    if (!valid) return { ok: false, error: "That discount code is not valid." };
    discountCents =
      code.kind === "percent"
        ? Math.round((subtotal * Math.min(code.value, 100)) / 100)
        : Math.min(code.value, subtotal);
    appliedCode = code.code;
    await supabase
      .from("discount_codes")
      .update({ used_count: code.used_count + 1 })
      .eq("id", code.id);
  }

  // 4. Upsert customer
  const email = data.email.toLowerCase();
  const { data: customer } = await supabase
    .from("customers")
    .upsert(
      { email, name: data.name, phone: data.phone || null },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  // 5. Create the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customer?.id ?? null,
      customer_name: data.name,
      email,
      phone: data.phone || null,
      location_id: schedule.location_id,
      schedule_id: schedule.id,
      pickup_date: schedule.market_date,
      pickup_time: data.pickupTime || null,
      payment_method: "pay_at_pickup", // Stripe path added when configured
      subtotal_cents: subtotal,
      discount_cents: discountCents,
      total_cents: Math.max(subtotal - discountCents, 0),
      has_unpriced_items: hasUnpriced,
      discount_code: appliedCode,
      customer_notes: data.notes || null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return {
      ok: false,
      error: "We couldn't save your order. Please try again.",
    };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);
    return {
      ok: false,
      error: "We couldn't save your order. Please try again.",
    };
  }

  return { ok: true, orderNumber: order.order_number };
}

/** Loads an order for the success page (requires matching email). */
export type OrderConfirmation = Order & {
  schedule: (MarketSchedule & { location: Location | null }) | null;
  items: OrderItem[];
};

export async function getOrderForConfirmation(
  orderNumber: string,
  email: string,
): Promise<OrderConfirmation | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "*, schedule:market_schedules(*, location:locations(*)), items:order_items(*)",
    )
    .eq("order_number", orderNumber)
    .ilike("email", email)
    .maybeSingle();
  return (data as unknown as OrderConfirmation | null) ?? null;
}
