import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flame } from "lucide-react";
import {
  getApprovedReviews,
  getProductBySlug,
  getRelatedProducts,
  getSettings,
  getUpcomingSchedules,
} from "@/lib/queries";
import { formatDate, formatTime } from "@/lib/utils";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductCard } from "@/components/store/product-card";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/json-ld";

export const revalidate = 120;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} — Handmade in Calgary`,
    description:
      product.short_description ??
      `${product.name}, handmade by Reem's Kitchen for Calgary farmers' markets.`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.short_description ?? undefined,
      images: product.images?.length
        ? [{ url: product.images[0].url }]
        : undefined,
    },
  };
}

const SPICE_LABELS = ["Not spicy", "Mild", "Medium", "Hot"];

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const [settings, related, reviews, schedules] = await Promise.all([
    getSettings(),
    getRelatedProducts(product, 4),
    getApprovedReviews(product.id, 6),
    getUpcomingSchedules(4),
  ]);

  // Only markets that actually carry this product (or have no product list)
  const pickupDays = schedules.filter(
    (s) =>
      !s.market_products?.length ||
      s.market_products.some((mp) => mp.product_id === product.id),
  );

  const stripeEnabled =
    settings.payment_stripe_enabled &&
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  // Details rows: hide anything without real data — never show dummy info
  const details: Array<{ label: string; value: React.ReactNode }> = [];
  if (product.unit_label)
    details.push({ label: "Size", value: product.unit_label });
  if (product.pieces_count)
    details.push({ label: "Pieces", value: `${product.pieces_count} pieces` });
  if (product.spice_level !== null)
    details.push({
      label: "Spice level",
      value: (
        <span className="inline-flex items-center gap-1">
          {SPICE_LABELS[product.spice_level]}
          {Array.from({ length: product.spice_level }).map((_, i) => (
            <Flame key={i} size={14} className="text-terracotta" aria-hidden />
          ))}
        </span>
      ),
    });
  if (product.ingredients?.length)
    details.push({
      label: "Ingredients",
      value: product.ingredients.join(", "),
    });
  if (product.allergens?.length)
    details.push({
      label: "Allergens",
      value: <span className="capitalize">{product.allergens.join(", ")}</span>,
    });
  if (product.storage_instructions)
    details.push({ label: "Storage", value: product.storage_instructions });
  if (product.serving_instructions)
    details.push({
      label: "Serving & reheating",
      value: product.serving_instructions,
    });
  if (product.shelf_life)
    details.push({ label: "Enjoy by", value: product.shelf_life });

  return (
    <div className="container-rk py-8 sm:py-12">
      <ProductJsonLd product={product} currency={settings.currency} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
          ...(product.category
            ? [
                {
                  name: product.category.name,
                  href: `/shop?category=${product.category.slug}`,
                },
              ]
            : []),
          { name: product.name, href: `/product/${product.slug}` },
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-cocoa-soft">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href="/shop" className="hover:underline">
              Shop
            </Link>
          </li>
          {product.category ? (
            <>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/shop?category=${product.category.slug}`}
                  className="hover:underline"
                >
                  {product.category.name}
                </Link>
              </li>
            </>
          ) : null}
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-medium text-cocoa">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          name={product.name}
          categoryName={product.category?.name}
          images={product.images ?? []}
        />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-1.5">
            {product.is_vegan ? (
              <span className="badge-vegan">Vegan</span>
            ) : product.is_vegetarian ? (
              <span className="badge-vegetarian">Vegetarian</span>
            ) : null}
            {product.is_sold_out ? (
              <span className="badge-soldout">Sold Out</span>
            ) : product.available_this_week ? (
              <span className="badge-available">Available this week</span>
            ) : null}
            {product.stock_quantity !== null &&
            !product.is_sold_out &&
            product.stock_quantity <= product.low_stock_threshold ? (
              <span className="badge bg-terracotta-soft text-terracotta">
                Only {product.stock_quantity} left
              </span>
            ) : null}
          </div>

          <div>
            <h1 className="font-display text-3xl font-semibold leading-tight">
              {product.name}
            </h1>
            {product.short_description ? (
              <p className="mt-2 text-cocoa-soft">
                {product.short_description}
              </p>
            ) : null}
          </div>

          <ProductPurchase product={product} stripeEnabled={stripeEnabled} />

          {/* Pickup availability */}
          <section aria-labelledby="pickup-heading" className="card p-4">
            <h2 id="pickup-heading" className="mb-2 font-semibold">
              Pickup dates & locations
            </h2>
            {pickupDays.length === 0 ? (
              <p className="text-sm text-cocoa-soft">
                Our next market location will be announced soon.{" "}
                <Link
                  href="/find-us"
                  className="font-medium text-lavender-deep underline"
                >
                  Check Find Us
                </Link>
              </p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {pickupDays.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-baseline gap-x-2"
                  >
                    <span className="font-medium">
                      {formatDate(s.market_date)}
                    </span>
                    <span className="text-cocoa-soft">
                      {s.location?.name} · {formatTime(s.start_time)}–
                      {formatTime(s.end_time)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {product.description ? (
            <div className="prose-sm max-w-none whitespace-pre-line leading-relaxed">
              {product.description}
            </div>
          ) : null}

          {details.length > 0 ? (
            <dl className="divide-y divide-cocoa/10 rounded-lg border border-cocoa/10 bg-white">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="grid grid-cols-3 gap-3 px-4 py-2.5 text-sm"
                >
                  <dt className="font-medium">{d.label}</dt>
                  <dd className="col-span-2 text-cocoa-soft">{d.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

      {/* Reviews — only real, approved reviews are ever shown */}
      {reviews.length > 0 ? (
        <section className="mt-14" aria-labelledby="pdp-reviews">
          <h2 id="pdp-reviews" className="section-title">
            Reviews
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.id} className="card flex flex-col gap-2 p-5">
                <div
                  className="text-honey"
                  role="img"
                  aria-label={`${r.rating} out of 5 stars`}
                >
                  {"★".repeat(r.rating)}
                  <span className="text-cocoa/20">
                    {"★".repeat(5 - r.rating)}
                  </span>
                </div>
                {r.body ? (
                  <blockquote className="text-sm">{r.body}</blockquote>
                ) : null}
                <figcaption className="mt-auto text-sm font-semibold">
                  {r.author_name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-14" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-title">
            You may also like
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
