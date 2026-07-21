"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  categorySchema,
  locationSchema,
  productSchema,
  scheduleSchema,
  settingsSchema,
} from "@/lib/validation";
import { slugify } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

export type ActionResult =
  { ok: true; id?: string } | { ok: false; error: string };

/**
 * Every admin action re-verifies the caller's role on the server.
 * RLS is the final gate, but failing early gives friendlier errors.
 */
async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["admin", "staff"].includes(profile.role)) {
    throw new Error("Not authorized");
  }
  return { supabase, userId: user.id };
}

function fail(e: unknown): ActionResult {
  const message = e instanceof Error ? e.message : "Something went wrong.";
  return { ok: false, error: message };
}

function revalidateStore() {
  revalidatePath("/", "layout");
}

// ------------------------------------------------------------------
// Products
// ------------------------------------------------------------------

export async function saveProduct(
  input: unknown,
  id?: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = productSchema.parse(input);
    const row = {
      name: data.name,
      slug: data.slug?.trim() ? slugify(data.slug) : slugify(data.name),
      category_id: data.categoryId || null,
      short_description: data.shortDescription || null,
      description: data.description || null,
      price_cents: data.priceCents,
      compare_at_price_cents: data.compareAtPriceCents,
      unit_label: data.unitLabel || null,
      pieces_count: data.piecesCount,
      stock_quantity: data.stockQuantity,
      low_stock_threshold: data.lowStockThreshold ?? 3,
      spice_level: data.spiceLevel,
      ingredients: data.ingredients ?? null,
      allergens: data.allergens ?? null,
      tags: data.tags ?? null,
      storage_instructions: data.storageInstructions || null,
      serving_instructions: data.servingInstructions || null,
      shelf_life: data.shelfLife || null,
      is_vegan: data.isVegan,
      is_vegetarian: data.isVegetarian,
      is_featured: data.isFeatured,
      is_sold_out: data.isSoldOut,
      available_this_week: data.availableThisWeek,
      is_published: data.isPublished,
      is_demo: data.isDemo ?? false,
    };

    if (id) {
      const { error } = await supabase
        .from("products")
        .update(row)
        .eq("id", id);
      if (error) throw new Error(error.message);
      revalidateStore();
      return { ok: true, id };
    }
    const { data: created, error } = await supabase
      .from("products")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    revalidateStore();
    return { ok: true, id: created.id };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function saveProductImages(
  productId: string,
  images: Array<{
    id?: string;
    url: string;
    altText?: string | null;
    sortOrder: number;
  }>,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    // Replace the image set: delete removed rows, upsert the rest with order.
    const keepIds = images.filter((i) => i.id).map((i) => i.id as string);
    let del = supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);
    if (keepIds.length > 0) {
      del = del.not("id", "in", `(${keepIds.join(",")})`);
    }
    const { error: delError } = await del;
    if (delError) throw new Error(delError.message);

    for (const img of images) {
      const row = {
        product_id: productId,
        url: img.url,
        alt_text: img.altText || null,
        sort_order: img.sortOrder,
      };
      const { error } = img.id
        ? await supabase.from("product_images").update(row).eq("id", img.id)
        : await supabase.from("product_images").insert(row);
      if (error) throw new Error(error.message);
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function saveProductVariants(
  productId: string,
  variants: Array<{
    id?: string;
    name: string;
    priceCents: number | null;
    isDefault: boolean;
    isSoldOut: boolean;
    sortOrder: number;
  }>,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const keepIds = variants.filter((v) => v.id).map((v) => v.id as string);
    let del = supabase
      .from("product_variants")
      .delete()
      .eq("product_id", productId);
    if (keepIds.length > 0) {
      del = del.not("id", "in", `(${keepIds.join(",")})`);
    }
    const { error: delError } = await del;
    if (delError) throw new Error(delError.message);

    for (const v of variants) {
      if (!v.name.trim()) continue;
      const row = {
        product_id: productId,
        name: v.name.trim(),
        price_cents: v.priceCents,
        is_default: v.isDefault,
        is_sold_out: v.isSoldOut,
        sort_order: v.sortOrder,
      };
      const { error } = v.id
        ? await supabase.from("product_variants").update(row).eq("id", v.id)
        : await supabase.from("product_variants").insert(row);
      if (error) throw new Error(error.message);
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// Categories
// ------------------------------------------------------------------

export async function saveCategory(
  input: unknown,
  id?: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = categorySchema.parse(input);
    const row = {
      name: data.name,
      slug: data.slug?.trim() ? slugify(data.slug) : slugify(data.name),
      description: data.description || null,
      image_url: data.imageUrl || null,
      sort_order: data.sortOrder ?? 0,
      is_visible: data.isVisible,
    };
    if (id) {
      const { error } = await supabase
        .from("categories")
        .update(row)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("categories").insert(row);
      if (error) throw new Error(error.message);
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// Locations
// ------------------------------------------------------------------

export async function saveLocation(
  input: unknown,
  id?: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = locationSchema.parse(input);
    const row = {
      name: data.name,
      address: data.address || null,
      map_url: data.mapUrl || null,
      phone: data.phone || null,
      hours_text: data.hoursText || null,
      pickup_instructions: data.pickupInstructions || null,
      image_url: data.imageUrl || null,
      is_active: data.isActive,
    };
    if (id) {
      const { error } = await supabase
        .from("locations")
        .update(row)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("locations").insert(row);
      if (error) throw new Error(error.message);
    }
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteLocation(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// Market schedules
// ------------------------------------------------------------------

export async function saveSchedule(
  input: unknown,
  id?: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = scheduleSchema.parse(input);
    const row = {
      location_id: data.locationId,
      market_date: data.marketDate,
      start_time: data.startTime,
      end_time: data.endTime,
      preorder_deadline: data.preorderDeadline || null,
      max_orders: data.maxOrders,
      is_published: data.isPublished,
    };
    let scheduleId = id;
    if (id) {
      const { error } = await supabase
        .from("market_schedules")
        .update(row)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabase
        .from("market_schedules")
        .insert(row)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      scheduleId = created.id;
    }

    // Sync product availability list for this market date
    if (scheduleId && data.productIds) {
      const { error: delError } = await supabase
        .from("market_products")
        .delete()
        .eq("schedule_id", scheduleId);
      if (delError) throw new Error(delError.message);
      if (data.productIds.length > 0) {
        const { error: insError } = await supabase
          .from("market_products")
          .insert(
            data.productIds.map((productId) => ({
              schedule_id: scheduleId,
              product_id: productId,
            })),
          );
        if (insError) throw new Error(insError.message);
      }
    }
    revalidateStore();
    return { ok: true, id: scheduleId };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteSchedule(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("market_schedules")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// Orders
// ------------------------------------------------------------------

const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "completed",
  "cancelled",
];

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    if (!ORDER_STATUSES.includes(status)) throw new Error("Invalid status");
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

export async function updateOrderAdminNote(
  id: string,
  note: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("orders")
      .update({ admin_note: note || null })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// Customers
// ------------------------------------------------------------------

export async function updateCustomerNote(
  id: string,
  note: string,
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase
      .from("customers")
      .update({ notes: note || null })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/customers");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// Content blocks
// ------------------------------------------------------------------

export async function saveContentBlock(
  key: string,
  values: {
    title?: string | null;
    body?: string | null;
    imageUrl?: string | null;
    extra?: unknown;
  },
): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("content_blocks").upsert(
      {
        key,
        title: values.title ?? null,
        body: values.body ?? null,
        image_url: values.imageUrl ?? null,
        extra: values.extra ?? {},
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// Settings
// ------------------------------------------------------------------

export async function saveSettings(input: unknown): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdmin();
    const data = settingsSchema.parse(input);
    const { error } = await supabase
      .from("site_settings")
      .update({
        store_name: data.storeName,
        tagline: data.tagline || null,
        logo_url: data.logoUrl || null,
        announcement_text: data.announcementText || null,
        announcement_href: data.announcementHref || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        instagram_url: data.instagramUrl || null,
        facebook_url: data.facebookUrl || null,
        currency: data.currency,
        tax_rate_percent: data.taxRatePercent,
        payment_pay_at_pickup_enabled: data.payAtPickupEnabled,
        payment_stripe_enabled: data.stripeEnabled,
        payment_methods_text: data.paymentMethodsText || null,
        pickup_policy: data.pickupPolicy || null,
        seo_title: data.seoTitle || null,
        seo_description: data.seoDescription || null,
        brand_colors: data.brandColors ?? {},
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    revalidateStore();
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

// ------------------------------------------------------------------
// Image upload (via server — keys never reach the browser)
// ------------------------------------------------------------------

const BUCKETS = [
  "product-images",
  "category-images",
  "location-images",
  "brand",
] as const;

export async function uploadImage(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireAdmin();
    const bucket = String(formData.get("bucket") ?? "product-images");
    const file = formData.get("file");
    if (!BUCKETS.includes(bucket as (typeof BUCKETS)[number])) {
      return { ok: false, error: "Unknown storage bucket." };
    }
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Please choose an image file." };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, error: "Images must be smaller than 5 MB." };
    }
    if (!file.type.startsWith("image/")) {
      return { ok: false, error: "Only image files can be uploaded." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) return { ok: false, error: error.message };

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return { ok: false, error: message };
  }
}
