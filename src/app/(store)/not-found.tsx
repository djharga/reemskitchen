import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-rk flex flex-col items-center gap-4 py-24 text-center">
      <p className="section-eyebrow">404</p>
      <h1 className="font-display text-3xl font-semibold">
        This page seems to have sold out.
      </h1>
      <p className="max-w-md text-cocoa-soft">
        The page you&apos;re looking for doesn&apos;t exist — but there&apos;s
        plenty of fresh bread, dips and sweets in the shop.
      </p>
      <div className="flex gap-3">
        <Link href="/shop" className="btn-primary">
          Browse the shop
        </Link>
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
      </div>
    </div>
  );
}
