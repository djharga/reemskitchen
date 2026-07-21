import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  ContentBlock,
  MarketSchedule,
  Product,
  Review,
  SiteSettings,
} from "@/lib/types";

const PRODUCT_SELECT =
  "*, category:categories(*), images:product_images(*), variants:product_variants(*)";

function sortJoins<T extends Product>(p: T): T {
  p.images?.sort((a, b) => a.sort_order - b.sort_order);
  p.variants?.sort((a, b) => a.sort_order - b.sort_order);
  return p;
}

/** Singleton settings row — cached per request. */
export const getSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();
  return (
    (data as SiteSettings | null) ?? {
      id: 1,
      store_name: "Reem's Kitchen",
      tagline: null,
      logo_url: null,
      email: null,
      phone: null,
      whatsapp: null,
      instagram_url: null,
      facebook_url: null,
      currency: "CAD",
      tax_rate_percent: 0,
      payment_pay_at_pickup_enabled: true,
      payment_stripe_enabled: false,
      payment_methods_text: null,
      pickup_policy: null,
      discounts_enabled: false,
      announcement_text: null,
      announcement_href: "/find-us",
      seo_title: null,
      seo_description: null,
      brand_colors: {},
    }
  );
});

export const getContentBlocks = cache(
  async (): Promise<Record<string, ContentBlock>> => {
    const supabase = createClient();
    const { data } = await supabase.from("content_blocks").select("*");
    const map: Record<string, ContentBlock> = {};
    for (const block of (data as ContentBlock[] | null) ?? [])
      map[block.key] = block;
    return map;
  },
);

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order");
  return (data as Category[] | null) ?? [];
});

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data as Product[] | null) ?? []).map(sortJoins);
}

export async function getVeganProducts(limit = 4): Promise<Product[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .eq("is_vegan", true)
    .order("is_featured", { ascending: false })
    .limit(limit);
  return ((data as Product[] | null) ?? []).map(sortJoins);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  return data ? sortJoins(data as Product) : null;
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true)
    .neq("id", product.id)
    .limit(limit);
  if (product.category_id) query = query.eq("category_id", product.category_id);
  const { data } = await query;
  return ((data as Product[] | null) ?? []).map(sortJoins);
}

export type ShopFilters = {
  q?: string;
  category?: string;
  vegan?: boolean;
  vegetarian?: boolean;
  inStock?: boolean;
  availableWeek?: boolean;
  tag?: string;
  spiceMax?: number;
  excludeAllergens?: string[];
  priceMin?: number; // dollars
  priceMax?: number; // dollars
  sort?: "newest" | "price_asc" | "price_desc" | "best_selling";
};

export async function getProducts(filters: ShopFilters): Promise<Product[]> {
  const supabase = createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_published", true);

  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, "")}%`;
    query = query.or(`name.ilike.${term},short_description.ilike.${term}`);
  }
  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
    else return [];
  }
  if (filters.vegan) query = query.eq("is_vegan", true);
  if (filters.vegetarian) query = query.eq("is_vegetarian", true);
  if (filters.inStock) query = query.eq("is_sold_out", false);
  if (filters.availableWeek) query = query.eq("available_this_week", true);
  if (filters.tag) query = query.contains("tags", [filters.tag]);
  if (filters.spiceMax !== undefined) {
    query = query.or(`spice_level.is.null,spice_level.lte.${filters.spiceMax}`);
  }
  if (filters.priceMin !== undefined) {
    query = query.gte("price_cents", Math.round(filters.priceMin * 100));
  }
  if (filters.priceMax !== undefined) {
    query = query.lte("price_cents", Math.round(filters.priceMax * 100));
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price_cents", {
        ascending: true,
        nullsFirst: false,
      });
      break;
    case "price_desc":
      query = query.order("price_cents", {
        ascending: false,
        nullsFirst: false,
      });
      break;
    case "best_selling":
      query = query.order("sales_count", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data } = await query;
  let products = ((data as Product[] | null) ?? []).map(sortJoins);

  // Allergen exclusion is applied in memory (array-not-contains is awkward in PostgREST)
  if (filters.excludeAllergens?.length) {
    const excluded = filters.excludeAllergens.map((a) => a.toLowerCase());
    products = products.filter(
      (p) =>
        !(p.allergens ?? []).some((a) => excluded.includes(a.toLowerCase())),
    );
  }
  return products;
}

/** Upcoming published market days (today onwards), with location + products. */
export async function getUpcomingSchedules(
  limit = 6,
): Promise<MarketSchedule[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("market_schedules")
    .select(
      "*, location:locations(*), market_products(product_id, product:products(id, slug, name, is_vegan, is_sold_out))",
    )
    .eq("is_published", true)
    .gte("market_date", today)
    .order("market_date")
    .limit(limit);
  return (data as unknown as MarketSchedule[] | null) ?? [];
}

export async function getApprovedReviews(
  productId?: string,
  limit = 6,
): Promise<Review[]> {
  const supabase = createClient();
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (productId) query = query.eq("product_id", productId);
  const { data } = await query;
  return (data as Review[] | null) ?? [];
}
