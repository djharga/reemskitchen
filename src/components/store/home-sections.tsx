import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink, MapPin } from "lucide-react";
import type {
  Category,
  ContentBlock,
  MarketSchedule,
  Product,
  Review,
} from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  formatTime,
  isPreorderOpen,
} from "@/lib/utils";
import { ProductCard } from "./product-card";
import { NewsletterForm } from "./newsletter-form";

// ---------------------------------------------------------------
// Home page sections. All copy/images come from the database
// (content_blocks + site_settings) — nothing customer-facing is
// hard-coded here beyond fallbacks.
// ---------------------------------------------------------------

export function Hero({ block }: { block?: ContentBlock }) {
  const extra = (block?.extra ?? {}) as Record<string, string>;
  const title =
    block?.title ?? "Fresh Middle Eastern Food, Handmade in Calgary";
  const body =
    block?.body ??
    "Handmade breads, savoury pastries, dips and sweets prepared in small batches for Calgary farmers' markets.";

  return (
    <section className="bg-cream-deep">
      <div className="container-rk grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-2 lg:py-20">
        <div className="max-w-xl">
          <p className="section-eyebrow">
            Calgary farmers&apos; markets · small batches
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base text-cocoa-soft sm:text-lg">{body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={extra.primary_href ?? "/shop"} className="btn-primary">
              {extra.primary_cta ?? "Shop the Menu"}
            </Link>
            <Link
              href={extra.secondary_href ?? "/find-us"}
              className="btn-secondary"
            >
              {extra.secondary_cta ?? "Find Us This Week"}
            </Link>
          </div>
        </div>
        {/* Hero image is editable from Admin -> Content -> Hero. Until a real
            photo is uploaded, show a warm branded panel (never a stock photo). */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-lavender/25">
          {block?.image_url ? (
            <Image
              src={block.image_url}
              alt="Freshly baked Middle Eastern food from Reem's Kitchen"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="text-lavender-deep"
              >
                <path
                  d="M4 13h16a8 8 0 0 1-16 0Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 9c0-1.2 1-1.4 1-2.6M14 9c0-1.2 1-1.4 1-2.6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <p className="font-display text-lg font-semibold text-cocoa">
                Baked fresh for market day
              </p>
              <p className="text-sm text-cocoa-soft">
                Add a hero photo from the admin panel
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function CategoryCards({ categories }: { categories: Category[] }) {
  if (!categories.length) return null;
  return (
    <section
      className="container-rk py-12 sm:py-16"
      aria-labelledby="categories-heading"
    >
      <p className="section-eyebrow">Shop by category</p>
      <h2 id="categories-heading" className="section-title">
        What are you craving?
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}`}
            className="card group overflow-hidden text-center transition-transform hover:-translate-y-0.5"
          >
            <div className="relative aspect-square w-full bg-cream-deep">
              {c.image_url ? (
                <Image
                  src={c.image_url}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 16vw"
                  className="object-cover"
                />
              ) : (
                <div
                  className={`absolute inset-0 ${
                    c.slug === "vegan"
                      ? "bg-olive-soft"
                      : "bg-gradient-to-br from-cream-deep to-terracotta-soft"
                  }`}
                />
              )}
            </div>
            <p className="px-2 py-3 text-sm font-semibold leading-snug group-hover:underline">
              {c.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section
      className="bg-white py-12 sm:py-16"
      aria-labelledby="featured-heading"
    >
      <div className="container-rk">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow">Fresh this week</p>
            <h2 id="featured-heading" className="section-title">
              Featured products
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm font-semibold text-lavender-deep underline sm:block"
          >
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <Link href="/shop" className="btn-secondary mt-6 w-full sm:hidden">
          View all products
        </Link>
      </div>
    </section>
  );
}

export function MarketWeek({ schedules }: { schedules: MarketSchedule[] }) {
  return (
    <section
      className="container-rk py-12 sm:py-16"
      aria-labelledby="market-heading"
    >
      <p className="section-eyebrow">This week at the market</p>
      <h2 id="market-heading" className="section-title">
        Where to find us
      </h2>

      {schedules.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center gap-3 px-6 py-12 text-center">
          <MapPin className="text-lavender-deep" aria-hidden />
          <p className="font-medium">
            Our next market location will be announced soon.
          </p>
          <p className="text-sm text-cocoa-soft">
            Join the newsletter below and we&apos;ll let you know where
            we&apos;ll be.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {schedules.slice(0, 2).map((s) => {
            const open = isPreorderOpen(s);
            return (
              <div key={s.id} className="card flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {s.location?.name}
                    </h3>
                    <p className="text-sm text-cocoa-soft">
                      {formatDate(s.market_date)}
                    </p>
                  </div>
                  <span className="badge-available shrink-0">
                    <Clock size={12} aria-hidden />
                    {formatTime(s.start_time)} – {formatTime(s.end_time)}
                  </span>
                </div>
                {s.location?.address ? (
                  <p className="flex items-center gap-1.5 text-sm text-cocoa-soft">
                    <MapPin size={14} aria-hidden /> {s.location.address}
                    {s.location.map_url ? (
                      <a
                        href={s.location.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-lavender-deep underline"
                      >
                        Map <ExternalLink size={12} aria-hidden />
                      </a>
                    ) : null}
                  </p>
                ) : null}
                {s.market_products?.length ? (
                  <p className="text-sm text-cocoa-soft">
                    Available:{" "}
                    {s.market_products
                      .map((mp) => mp.product?.name)
                      .filter(Boolean)
                      .slice(0, 6)
                      .join(", ")}
                  </p>
                ) : null}
                {s.preorder_deadline ? (
                  <p className="text-xs text-cocoa-soft">
                    Pre-order by {formatDateTime(s.preorder_deadline)}
                  </p>
                ) : null}
                <div className="mt-auto pt-1">
                  {open ? (
                    <Link href="/shop?available=1" className="btn-primary">
                      Pre-order for Pickup
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-cocoa-soft">
                      Pre-orders closed for this date
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function VeganSection({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section
      className="bg-olive-soft py-12 sm:py-16"
      aria-labelledby="vegan-heading"
    >
      <div className="container-rk">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-eyebrow !text-olive">Plant-based</p>
            <h2 id="vegan-heading" className="section-title">
              Vegan selection
            </h2>
            <p className="mt-2 max-w-lg text-sm text-cocoa-soft">
              Fully plant-based breads, dips and pastries — same recipes, same
              care.
            </p>
          </div>
          <Link
            href="/shop?vegan=1"
            className="hidden text-sm font-semibold text-olive underline sm:block"
          >
            View all vegan
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <Link href="/shop?vegan=1" className="btn-olive mt-6 w-full sm:hidden">
          View all vegan products
        </Link>
      </div>
    </section>
  );
}

export function StorySection({ block }: { block?: ContentBlock }) {
  return (
    <section
      className="container-rk py-12 sm:py-16"
      aria-labelledby="story-heading"
    >
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-lg bg-terracotta-soft lg:order-1">
          {block?.image_url ? (
            <Image
              src={block.image_url}
              alt="Reem preparing food by hand"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <p className="text-sm text-cocoa-soft">
                Add a photo of Reem&apos;s kitchen from the admin panel
              </p>
            </div>
          )}
        </div>
        <div className="order-1 max-w-xl lg:order-2">
          <p className="section-eyebrow">Reem&apos;s story</p>
          <h2 id="story-heading" className="section-title">
            {block?.title ?? "From Reem's kitchen to your table"}
          </h2>
          <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-cocoa-soft">
            {block?.body ??
              "Every loaf, tray and tub is made by hand, in small batches, with recipes from home."}
          </p>
          <Link href="/about" className="btn-secondary mt-6">
            Read more
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BundlesSection({
  block,
  products,
}: {
  block?: ContentBlock;
  products: Product[];
}) {
  const extra = (block?.extra ?? {}) as Record<string, string>;
  return (
    <section
      className="bg-cream-deep py-12 sm:py-16"
      aria-labelledby="bundles-heading"
    >
      <div className="container-rk">
        <p className="section-eyebrow">
          Gatherings · events · families · offices
        </p>
        <h2 id="bundles-heading" className="section-title">
          {block?.title ?? "Bundles & party orders"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-cocoa-soft sm:text-base">
          {block?.body ??
            "Feeding a crowd? We prepare boxes for gatherings, celebrations and office events."}
        </p>
        {products.length ? (
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : null}
        <div className="mt-6">
          <Link href="/about#custom-orders" className="btn-primary">
            {extra.cta ?? "Request a Custom Order"}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  // Ready to link to Google Reviews later; hidden while there are no
  // approved reviews — never show fabricated testimonials.
  if (!reviews.length) return null;
  return (
    <section
      className="container-rk py-12 sm:py-16"
      aria-labelledby="reviews-heading"
    >
      <p className="section-eyebrow">From our customers</p>
      <h2 id="reviews-heading" className="section-title">
        Kind words from the market
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <figure key={r.id} className="card flex flex-col gap-2 p-5">
            <div
              aria-label={`${r.rating} out of 5 stars`}
              className="text-honey"
              role="img"
            >
              {"★".repeat(r.rating)}
              <span className="text-cocoa/20">{"★".repeat(5 - r.rating)}</span>
            </div>
            {r.body ? (
              <blockquote className="text-sm leading-relaxed">
                {r.body}
              </blockquote>
            ) : null}
            <figcaption className="mt-auto text-sm font-semibold">
              {r.author_name}
              {r.source === "google" ? (
                <span className="ms-1 font-normal text-cocoa-soft">
                  · Google review
                </span>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section
      className="bg-lavender-deep py-12 text-white sm:py-16"
      aria-labelledby="newsletter-heading"
    >
      <div className="container-rk grid items-center gap-6 lg:grid-cols-2">
        <div>
          <h2
            id="newsletter-heading"
            className="font-display text-2xl font-semibold sm:text-3xl"
          >
            Get This Week&apos;s Menu
          </h2>
          <p className="mt-2 text-sm text-white/80 sm:text-base">
            The week&apos;s menu, market dates, new products and offers — no
            spam, just fresh bread.
          </p>
        </div>
        <div className="rounded-lg bg-white/10 p-4 sm:p-5">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
