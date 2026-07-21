import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  getCategories,
  getProducts,
  type ShopFilters as Filters,
} from "@/lib/queries";
import { ShopFilters } from "@/components/store/shop-filters";
import { ProductCard } from "@/components/store/product-card";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" && v !== "" ? v : undefined;
}

function parseFilters(sp: SearchParams): Filters {
  const sortParam = str(sp.sort);
  const sort = ["newest", "price_asc", "price_desc", "best_selling"].includes(
    sortParam ?? "",
  )
    ? (sortParam as Filters["sort"])
    : "newest";
  return {
    q: str(sp.q),
    category: str(sp.category),
    vegan: sp.vegan === "1",
    vegetarian: sp.vegetarian === "1",
    inStock: sp.instock === "1",
    availableWeek: sp.available === "1",
    tag: str(sp.tag),
    spiceMax: str(sp.spice) !== undefined ? Number(sp.spice) : undefined,
    excludeAllergens: str(sp.noallergens)?.split(",").filter(Boolean),
    priceMin: str(sp.pricemin) !== undefined ? Number(sp.pricemin) : undefined,
    priceMax: str(sp.pricemax) !== undefined ? Number(sp.pricemax) : undefined,
    sort,
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const category = str(searchParams.category);
  if (category) {
    const categories = await getCategories();
    const cat = categories.find((c) => c.slug === category);
    if (cat) {
      return {
        title: `${cat.name} in Calgary`,
        description:
          cat.description ??
          `Handmade ${cat.name.toLowerCase()} from Reem's Kitchen — fresh for Calgary farmers' markets.`,
        alternates: { canonical: `/shop?category=${cat.slug}` },
      };
    }
  }
  return {
    title: "Shop Handmade Middle Eastern Food in Calgary",
    description:
      "Browse handmade naan, focaccia, samosas, hummus, baklava and more — baked in small batches for Calgary farmers' markets.",
    alternates: { canonical: "/shop" },
  };
}

async function ProductResults({ filters }: { filters: Filters }) {
  const products = await getProducts(filters);

  if (products.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">
          No products match these filters.
        </p>
        <p className="text-sm text-cocoa-soft">
          Try removing a filter or two — or browse everything we make.
        </p>
        <Link href="/shop" className="btn-secondary mt-1">
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-cocoa-soft" aria-live="polite">
        {products.length} product{products.length === 1 ? "" : "s"}
      </p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <div className="skeleton aspect-square w-full !rounded-none" />
          <div className="space-y-2 p-4">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-8 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const categories = await getCategories();
  const filters = parseFilters(searchParams);
  const activeCat = categories.find((c) => c.slug === filters.category);

  return (
    <div className="container-rk flex flex-col gap-5 py-8 sm:py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
          ...(activeCat
            ? [
                {
                  name: activeCat.name,
                  href: `/shop?category=${activeCat.slug}`,
                },
              ]
            : []),
        ]}
      />
      <div>
        <h1 className="font-display text-3xl font-semibold">
          {activeCat ? activeCat.name : "Shop"}
        </h1>
        <p className="mt-1 text-cocoa-soft">
          {activeCat?.description ??
            "Everything is handmade in small batches for market day."}
        </p>
      </div>
      <ShopFilters categories={categories} />
      <Suspense fallback={<GridSkeleton />}>
        <ProductResults filters={filters} />
      </Suspense>
    </div>
  );
}
