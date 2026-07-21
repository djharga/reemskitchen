import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getContentBlocks, getSettings } from "@/lib/queries";
import { FaqJsonLd } from "@/components/seo/json-ld";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About — Reem's Story",
  description:
    "The story behind Reem's Kitchen: handmade Middle Eastern food, baked in small batches for Calgary farmers' markets.",
  alternates: { canonical: "/about" },
};

type FaqItem = { q: string; a: string };

export default async function AboutPage() {
  const [content, settings] = await Promise.all([
    getContentBlocks(),
    getSettings(),
  ]);
  const story = content.story;
  const faq = content.faq;
  const policies = content.policies;
  const custom = content.custom_orders;
  const faqItems = (
    (faq?.extra as { items?: FaqItem[] } | undefined)?.items ?? []
  ).filter((i) => i.q && i.a);

  return (
    <div className="container-rk max-w-3xl py-10 sm:py-14">
      <FaqJsonLd items={faqItems} />

      <p className="section-eyebrow">Our story</p>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">
        {story?.title ?? "From Reem's kitchen to your table"}
      </h1>
      {story?.image_url ? (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg bg-cream-deep">
          <Image
            src={story.image_url}
            alt="Inside Reem's kitchen"
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="mt-6 whitespace-pre-line text-base leading-relaxed text-cocoa-soft">
        {story?.body ??
          "Every loaf, tray and tub is made by hand, in small batches, with recipes from home."}
      </div>

      <section
        id="custom-orders"
        className="card mt-12 p-6"
        aria-labelledby="custom-orders-h"
      >
        <h2
          id="custom-orders-h"
          className="font-display text-2xl font-semibold"
        >
          {custom?.title ?? "Bundles & party orders"}
        </h2>
        <p className="mt-2 text-cocoa-soft">
          {custom?.body ??
            "We prepare boxes for gatherings, celebrations, families and office events."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/shop?category=bundles" className="btn-primary">
            Browse bundles
          </Link>
          {settings.email ? (
            <a
              href={`mailto:${settings.email}?subject=Custom order request`}
              className="btn-secondary"
            >
              Request a Custom Order
            </a>
          ) : (
            <Link href="/shop?category=bundles" className="btn-secondary">
              Request a Custom Order at checkout
            </Link>
          )}
        </div>
        {!settings.email ? (
          <p className="mt-2 text-xs text-cocoa-soft">
            Add a note to your pre-order and we&apos;ll get back to you about
            custom boxes.
          </p>
        ) : null}
      </section>

      {faqItems.length > 0 ? (
        <section id="faq" className="mt-12" aria-labelledby="faq-h">
          <h2 id="faq-h" className="font-display text-2xl font-semibold">
            {faq?.title ?? "Frequently Asked Questions"}
          </h2>
          <div className="mt-4 divide-y divide-cocoa/10 rounded-lg border border-cocoa/10 bg-white">
            {faqItems.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-medium marker:hidden">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-cocoa-soft">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {policies?.body ? (
        <section id="policies" className="mt-12" aria-labelledby="policies-h">
          <h2 id="policies-h" className="font-display text-2xl font-semibold">
            {policies.title ?? "Policies"}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-cocoa-soft">
            {policies.body}
          </p>
        </section>
      ) : null}
    </div>
  );
}
