import { z } from "zod";

// ---------------------------------------------------------------
// Zod schemas — used by BOTH client forms (react-hook-form) and
// server actions, so nothing relies on client-side validation alone.
// ---------------------------------------------------------------

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  scheduleId: z.string().uuid("Please choose a pickup date"),
  pickupTime: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  discountCode: z.string().trim().max(40).optional().or(z.literal("")),
  paymentMethod: z.enum(["pay_at_pickup", "stripe"]).default("pay_at_pickup"),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable(),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160),
  short_description: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  category_id: z.string().uuid().nullable(),
  price_cents: z.number().int().min(0).nullable(),
  compare_at_price_cents: z.number().int().min(0).nullable(),
  unit_label: z.string().trim().max(80).optional().or(z.literal("")),
  pieces_count: z.number().int().min(0).nullable(),
  spice_level: z.number().int().min(0).max(3).nullable(),
  ingredients: z.array(z.string().trim().min(1)).nullable(),
  allergens: z.array(z.string().trim().min(1)).nullable(),
  storage_instructions: z.string().trim().max(500).optional().or(z.literal("")),
  serving_instructions: z.string().trim().max(500).optional().or(z.literal("")),
  shelf_life: z.string().trim().max(120).optional().or(z.literal("")),
  is_vegan: z.boolean(),
  is_vegetarian: z.boolean(),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  is_sold_out: z.boolean(),
  available_this_week: z.boolean(),
  stock_quantity: z.number().int().min(0).nullable(),
  tags: z.array(z.string().trim().min(1)).nullable(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  sort_order: z.number().int(),
  is_visible: z.boolean(),
});

export const locationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  map_url: z.string().trim().url().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  hours_note: z.string().trim().max(200).optional().or(z.literal("")),
  pickup_instructions: z.string().trim().max(1000).optional().or(z.literal("")),
  is_active: z.boolean(),
  sort_order: z.number().int(),
});

export const scheduleSchema = z.object({
  location_id: z.string().uuid(),
  market_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  start_time: z.string().regex(/^\d{2}:\d{2}/, "Use HH:MM"),
  end_time: z.string().regex(/^\d{2}:\d{2}/, "Use HH:MM"),
  preorder_deadline: z.string().nullable(),
  max_orders: z.number().int().min(1).nullable(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  is_published: z.boolean(),
});

export const settingsSchema = z.object({
  store_name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  instagram_url: z.string().trim().url().optional().or(z.literal("")),
  facebook_url: z.string().trim().url().optional().or(z.literal("")),
  currency: z.string().trim().length(3),
  tax_rate: z.number().min(0).max(1),
  payment_pay_at_pickup: z.boolean(),
  payment_stripe_enabled: z.boolean(),
  announcement_text: z.string().trim().max(200).optional().or(z.literal("")),
  announcement_href: z.string().trim().max(200).optional().or(z.literal("")),
  seo_title: z.string().trim().max(120).optional().or(z.literal("")),
  seo_description: z.string().trim().max(300).optional().or(z.literal("")),
});
