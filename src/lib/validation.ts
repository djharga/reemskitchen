import { z } from "zod";

// ---------------------------------------------------------------
// Zod schemas — used by BOTH client forms (react-hook-form) and
// server actions, so nothing relies on client-side validation alone.
// Admin form payloads use camelCase keys; the server actions in
// src/app/actions/admin.ts map them to snake_case database columns.
// ---------------------------------------------------------------

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

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
  slug: optionalString(160),
  categoryId: z.string().uuid().nullable(),
  shortDescription: optionalString(300),
  description: optionalString(5000),
  priceCents: z.number().int().min(0).nullable(),
  compareAtPriceCents: z.number().int().min(0).nullable(),
  unitLabel: optionalString(80),
  piecesCount: z.number().int().min(0).nullable(),
  stockQuantity: z.number().int().min(0).nullable(),
  lowStockThreshold: z.number().int().min(0).nullable().optional(),
  spiceLevel: z.number().int().min(0).max(3).nullable(),
  ingredients: z.array(z.string().trim().min(1)).nullable(),
  allergens: z.array(z.string().trim().min(1)).nullable(),
  tags: z.array(z.string().trim().min(1)).nullable(),
  storageInstructions: optionalString(500),
  servingInstructions: optionalString(500),
  shelfLife: optionalString(120),
  isVegan: z.boolean(),
  isVegetarian: z.boolean(),
  isFeatured: z.boolean(),
  isSoldOut: z.boolean(),
  availableThisWeek: z.boolean(),
  isPublished: z.boolean(),
  isDemo: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: optionalString(120),
  description: optionalString(500),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean(),
});

export const locationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  address: optionalString(300),
  mapUrl: z.string().trim().url().optional().or(z.literal("")),
  phone: optionalString(30),
  hoursText: optionalString(200),
  pickupInstructions: optionalString(1000),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export const scheduleSchema = z.object({
  locationId: z.string().uuid("Choose a pickup location"),
  marketDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  startTime: z.string().regex(/^\d{2}:\d{2}/, "Use HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}/, "Use HH:MM"),
  preorderDeadline: z.string().nullable(),
  maxOrders: z.number().int().min(1).nullable(),
  isPublished: z.boolean(),
  productIds: z.array(z.string().uuid()).optional(),
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(1).max(120),
  tagline: optionalString(200),
  logoUrl: z.string().nullable().optional(),
  announcementText: optionalString(200),
  announcementHref: optionalString(200),
  phone: optionalString(30),
  whatsapp: optionalString(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  instagramUrl: z.string().trim().url().optional().or(z.literal("")),
  facebookUrl: z.string().trim().url().optional().or(z.literal("")),
  currency: z.string().trim().length(3),
  taxRatePercent: z.number().min(0).max(100),
  payAtPickupEnabled: z.boolean(),
  stripeEnabled: z.boolean(),
  paymentMethodsText: optionalString(300),
  pickupPolicy: optionalString(2000),
  discountsEnabled: z.boolean().optional(),
  seoTitle: optionalString(120),
  seoDescription: optionalString(300),
  brandColors: z.record(z.string()).optional(),
});
