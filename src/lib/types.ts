// ---------------------------------------------------------------
// Shared row types (kept in sync with supabase/migrations/*.sql).
// For full type-safety you can generate types with:
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
// ---------------------------------------------------------------

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  price_cents: number | null;
  stock_quantity: number | null;
  is_sold_out: boolean;
  is_default: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  price_cents: number | null;
  compare_at_price_cents: number | null;
  unit_label: string | null;
  pieces_count: number | null;
  spice_level: number | null;
  ingredients: string[] | null;
  allergens: string[] | null;
  storage_instructions: string | null;
  serving_instructions: string | null;
  shelf_life: string | null;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_featured: boolean;
  is_active: boolean;
  is_sold_out: boolean;
  available_this_week: boolean;
  stock_quantity: number | null;
  low_stock_threshold: number;
  tags: string[] | null;
  is_demo: boolean;
  sales_count: number;
  created_at: string;
  // joins
  category?: Category | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
};

export type Location = {
  id: string;
  name: string;
  address: string | null;
  map_url: string | null;
  phone: string | null;
  image_url: string | null;
  hours_note: string | null;
  pickup_instructions: string | null;
  is_active: boolean;
  sort_order: number;
};

export type MarketSchedule = {
  id: string;
  location_id: string;
  market_date: string;
  start_time: string;
  end_time: string;
  preorder_deadline: string | null;
  max_orders: number | null;
  notes: string | null;
  is_published: boolean;
  // joins
  location?: Location | null;
  market_products?: { product_id: string; product?: Product | null }[];
};

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  email: string;
  phone: string | null;
  location_id: string | null;
  schedule_id: string | null;
  pickup_date: string | null;
  pickup_time: string | null;
  status: OrderStatus;
  payment_method: "pay_at_pickup" | "stripe";
  payment_status: "unpaid" | "paid" | "refunded";
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  has_unpriced_items: boolean;
  discount_code: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  // joins
  location?: Location | null;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  unit_price_cents: number | null;
  quantity: number;
  line_total_cents: number | null;
};

export type Review = {
  id: string;
  product_id: string | null;
  author_name: string;
  rating: number;
  body: string | null;
  source: "site" | "google";
  is_approved: boolean;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  store_name: string;
  tagline: string | null;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  currency: string;
  tax_rate: number;
  payment_pay_at_pickup: boolean;
  payment_stripe_enabled: boolean;
  announcement_text: string | null;
  announcement_href: string | null;
  seo_title: string | null;
  seo_description: string | null;
  brand_colors: Record<string, string>;
};

export type ContentBlock = {
  key: string;
  title: string | null;
  body: string | null;
  image_url: string | null;
  extra: Record<string, unknown>;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export type DiscountCode = {
  id: string;
  code: string;
  kind: "percent" | "fixed";
  value: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  used_count: number;
};

/** Cart item stored client-side (prices re-verified server-side at checkout). */
export type CartItem = {
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantName: string | null;
  priceCents: number | null;
  imageUrl: string | null;
  quantity: number;
};
