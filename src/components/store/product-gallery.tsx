"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage as ProductImageType } from "@/lib/types";
import { ProductImage } from "./product-image";

/**
 * Multi-image gallery with tap/hover zoom. Falls back to the branded
 * placeholder when the product has no photos yet.
 */
export function ProductGallery({
  name,
  categoryName,
  images,
}: {
  name: string;
  categoryName?: string | null;
  images: ProductImageType[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const active = images[activeIndex];

  if (images.length === 0) {
    return (
      <ProductImage
        name={name}
        categoryName={categoryName}
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        className="media-square cursor-zoom-in"
        onClick={() => setZoomed(true)}
        aria-label="Zoom image"
      >
        <Image
          src={active.url}
          alt={active.alt_text ?? name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </button>

      {images.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-square overflow-hidden rounded border-2 ${
                i === activeIndex
                  ? "border-lavender-deep"
                  : "border-transparent"
              }`}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-current={i === activeIndex}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {zoomed ? (
        <div
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-cocoa/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Zoomed image of ${name}`}
          onClick={() => setZoomed(false)}
        >
          <div className="relative h-full max-h-[85vh] w-full max-w-3xl">
            <Image
              src={active.url}
              alt={active.alt_text ?? name}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <button
            className="absolute right-4 top-4 rounded-full bg-white px-3 py-1.5 text-sm font-semibold"
            onClick={() => setZoomed(false)}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
