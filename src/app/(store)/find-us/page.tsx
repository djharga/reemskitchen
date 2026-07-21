import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink, MapPin } from "lucide-react";
import { getUpcomingSchedules } from "@/lib/queries";
import {
  formatDate,
  formatDateTime,
  formatTime,
  isPreorderOpen,
  marketStatus,
} from "@/lib/utils";
import { NewsletterForm } from "@/components/store/newsletter-form";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Find Us — Calgary Farmers' Markets",
  description:
    "Where to find Reem's Kitchen this week: market locations, dates, hours and pickup instructions in Calgary.",
  alternates: { canonical: "/find-us" },
};

const STATUS_STYLE: Record<string, string> = {
  open: "badge bg-olive-soft text-olive",
  upcoming: "badge bg-terracotta-soft text-terracotta",
  closed: "badge bg-cocoa/10 text-cocoa-soft",
};

export default async function FindUsPage() {
  const schedules = await getUpcomingSchedules(8);

  return (
    <div className="container-rk py-8 sm:py-12">
      <p className="section-eyebrow">Markets & pickup</p>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">
        Find Us
      </h1>
      <p className="mt-2 max-w-2xl text-cocoa-soft">
        We bake fresh for every market. Pre-order online and pick up at our
        stall, or come by and say hello — there&apos;s usually something warm to
        taste.
      </p>

      {schedules.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center gap-4 px-6 py-16 text-center">
          <MapPin size={32} className="text-lavender-deep" aria-hidden />
          <p className="font-display text-xl font-semibold">
            Our next market location will be announced soon.
          </p>
          <p className="max-w-md text-sm text-cocoa-soft">
            Market dates are added throughout the season. Join the newsletter
            and we&apos;ll email you as soon as the next date is confirmed.
          </p>
          <div className="w-full max-w-sm">
            <NewsletterForm />
          </div>
          <Link href="/shop" className="btn-secondary">
            Browse the menu meanwhile
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {schedules.map((s) => {
            const status = marketStatus(s);
            const preorder = isPreorderOpen(s);
            return (
              <article
                key={s.id}
                className="card flex flex-col overflow-hidden"
              >
                {s.location?.image_url ? (
                  <div className="relative aspect-[16/7] w-full bg-cream-deep">
                    <Image
                      src={s.location.image_url}
                      alt={s.location?.name ?? "Market location"}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl font-semibold">
                        {s.location?.name}
                      </h2>
                      <p className="text-sm font-medium text-terracotta">
                        {formatDate(s.market_date)}
                      </p>
                    </div>
                    <span className={STATUS_STYLE[status]}>
                      {status === "open"
                        ? "Open now"
                        : status === "upcoming"
                          ? "Upcoming"
                          : "Closed"}
                    </span>
                  </div>

                  <p className="flex items-center gap-1.5 text-sm text-cocoa-soft">
                    <Clock size={14} aria-hidden />
                    {formatTime(s.start_time)} – {formatTime(s.end_time)}
                  </p>

                  {s.location?.address ? (
                    <p className="flex flex-wrap items-center gap-1.5 text-sm text-cocoa-soft">
                      <MapPin size={14} aria-hidden />
                      {s.location.address}
                      {s.location.map_url ? (
                        <a
                          href={s.location.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-lavender-deep underline"
                        >
                          Google Maps <ExternalLink size={12} aria-hidden />
                        </a>
                      ) : null}
                    </p>
                  ) : null}

                  {s.location?.pickup_instructions ? (
                    <p className="rounded bg-cream-deep px-3 py-2 text-sm">
                      <span className="font-medium">Pickup: </span>
                      {s.location.pickup_instructions}
                    </p>
                  ) : null}

                  {s.market_products?.length ? (
                    <div className="text-sm">
                      <p className="mb-1 font-medium">
                        Available at this market:
                      </p>
                      <ul className="flex flex-wrap gap-1.5">
                        {s.market_products.map((mp) =>
                          mp.product ? (
                            <li key={mp.product_id}>
                              <Link
                                href={`/product/${mp.product.slug}`}
                                className="inline-block rounded-full border border-cocoa/15 bg-white px-2.5 py-1 text-xs hover:border-cocoa/40"
                              >
                                {mp.product.name}
                              </Link>
                            </li>
                          ) : null,
                        )}
                      </ul>
                    </div>
                  ) : null}

                  {s.preorder_deadline ? (
                    <p className="text-xs text-cocoa-soft">
                      Pre-order by {formatDateTime(s.preorder_deadline)}
                    </p>
                  ) : null}

                  <div className="mt-auto pt-2">
                    {preorder && status !== "closed" ? (
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
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
