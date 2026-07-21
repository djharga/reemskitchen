import Image from "next/image";

/**
 * Product imagery with a graceful, branded placeholder.
 * - Fixed square ratio -> zero layout shift while loading.
 * - No image? Show an elegant placeholder with the product name and
 *   category — never a broken image, never a fake stock photo.
 */
export function ProductImage({
  name,
  categoryName,
  imageUrl,
  alt,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
}: {
  name: string;
  categoryName?: string | null;
  imageUrl?: string | null;
  alt?: string | null;
  sizes?: string;
  priority?: boolean;
}) {
  if (!imageUrl) {
    return (
      <div className="media-square">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-cream-deep to-terracotta-soft p-4 text-center">
          <PlaceholderMark />
          <p className="font-display text-sm font-semibold leading-snug text-cocoa">
            {name}
          </p>
          {categoryName ? (
            <p className="text-xs uppercase tracking-wide text-cocoa-soft">
              {categoryName}
            </p>
          ) : null}
        </div>
      </div>
    );
  }
  return (
    <div className="media-square">
      <Image
        src={imageUrl}
        alt={alt ?? name}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

/** Small square thumb (cart drawer, order summary). */
export function ProductThumb({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl?: string | null;
}) {
  if (!imageUrl) {
    return (
      <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded bg-cream-deep">
        <PlaceholderMark small />
      </div>
    );
  }
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded bg-cream-deep">
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes="64px"
        className="object-cover"
      />
    </div>
  );
}

/** Tiny brand mark used inside placeholders (simple bowl + steam). */
function PlaceholderMark({ small = false }: { small?: boolean }) {
  const size = small ? 20 : 28;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-lavender-deep opacity-70"
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
  );
}
