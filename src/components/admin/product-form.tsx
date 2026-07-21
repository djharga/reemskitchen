"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, UploadCloud, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import {
  saveProduct,
  saveProductImages,
  saveProductVariants,
  uploadImage,
} from "@/app/actions/admin";
import { SaveBanner } from "./ui";

type ImageRow = {
  id?: string;
  url: string;
  altText: string;
  sortOrder: number;
};
type VariantRow = {
  id?: string;
  name: string;
  price: string; // dollars as text; empty = no price yet
  isDefault: boolean;
  isSoldOut: boolean;
};

function centsToInput(cents: number | null | undefined): string {
  return cents === null || cents === undefined ? "" : (cents / 100).toFixed(2);
}

function inputToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 0) return null;
  return Math.round(num * 100);
}

function listToInput(list: string[] | null | undefined): string {
  return (list ?? []).join(", ");
}

function inputToList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Full product editor: details, pricing, inventory, dietary flags,
 * multi-image upload with ordering, and size/option variants.
 */
export function ProductForm({
  product,
  categories,
}: {
  product: Product | null;
  categories: Category[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // --- basic fields ---
  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [shortDescription, setShortDescription] = useState(
    product?.short_description ?? "",
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(centsToInput(product?.price_cents));
  const [compareAtPrice, setCompareAtPrice] = useState(
    centsToInput(product?.compare_at_price_cents),
  );
  const [unitLabel, setUnitLabel] = useState(product?.unit_label ?? "");
  const [piecesCount, setPiecesCount] = useState(
    product?.pieces_count !== null && product?.pieces_count !== undefined
      ? String(product.pieces_count)
      : "",
  );
  const [stockQuantity, setStockQuantity] = useState(
    product?.stock_quantity !== null && product?.stock_quantity !== undefined
      ? String(product.stock_quantity)
      : "",
  );
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(product?.low_stock_threshold ?? 3),
  );
  const [spiceLevel, setSpiceLevel] = useState(
    product?.spice_level !== null && product?.spice_level !== undefined
      ? String(product.spice_level)
      : "",
  );
  const [ingredients, setIngredients] = useState(
    listToInput(product?.ingredients),
  );
  const [allergens, setAllergens] = useState(listToInput(product?.allergens));
  const [tags, setTags] = useState(listToInput(product?.tags));
  const [storageInstructions, setStorageInstructions] = useState(
    product?.storage_instructions ?? "",
  );
  const [servingInstructions, setServingInstructions] = useState(
    product?.serving_instructions ?? "",
  );
  const [shelfLife, setShelfLife] = useState(product?.shelf_life ?? "");
  const [isVegan, setIsVegan] = useState(product?.is_vegan ?? false);
  const [isVegetarian, setIsVegetarian] = useState(
    product?.is_vegetarian ?? false,
  );
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isSoldOut, setIsSoldOut] = useState(product?.is_sold_out ?? false);
  const [availableThisWeek, setAvailableThisWeek] = useState(
    product?.available_this_week ?? false,
  );
  const [isPublished, setIsPublished] = useState(product?.is_published ?? true);
  const [isDemo, setIsDemo] = useState(product?.is_demo ?? false);

  // --- images ---
  const [images, setImages] = useState<ImageRow[]>(
    (product?.images ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img, i) => ({
        id: img.id,
        url: img.url,
        altText: img.alt_text ?? "",
        sortOrder: i,
      })),
  );

  // --- variants ---
  const [variants, setVariants] = useState<VariantRow[]>(
    (product?.variants ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((v) => ({
        id: v.id,
        name: v.name,
        price: centsToInput(v.price_cents),
        isDefault: v.is_default,
        isSoldOut: v.is_sold_out,
      })),
  );

  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((img, i) => ({ ...img, sortOrder: i }));
    });
  }

  async function handleUpload(files: FileList) {
    setUploading(true);
    setBanner(null);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.set("bucket", "product-images");
      formData.set("file", file);
      const result = await uploadImage(formData);
      if (result.ok) {
        setImages((prev) => [
          ...prev,
          { url: result.url, altText: "", sortOrder: prev.length },
        ]);
      } else {
        setBanner({ ok: false, message: result.error });
      }
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    setBanner(null);

    const payload = {
      name,
      slug: product?.slug ?? "",
      categoryId: categoryId || null,
      shortDescription,
      description,
      priceCents: inputToCents(price),
      compareAtPriceCents: inputToCents(compareAtPrice),
      unitLabel,
      piecesCount: piecesCount.trim() ? Number(piecesCount) : null,
      stockQuantity: stockQuantity.trim() ? Number(stockQuantity) : null,
      lowStockThreshold: Number(lowStockThreshold) || 3,
      spiceLevel: spiceLevel.trim() ? Number(spiceLevel) : null,
      ingredients: inputToList(ingredients),
      allergens: inputToList(allergens),
      tags: inputToList(tags),
      storageInstructions,
      servingInstructions,
      shelfLife,
      isVegan,
      isVegetarian,
      isFeatured,
      isSoldOut,
      availableThisWeek,
      isPublished,
      isDemo,
    };

    const result = await saveProduct(payload, product?.id);
    if (!result.ok) {
      setBanner({ ok: false, message: result.error });
      setSaving(false);
      return;
    }

    const productId = product?.id ?? result.id;
    if (productId) {
      const imagesResult = await saveProductImages(
        productId,
        images.map((img, i) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          sortOrder: i,
        })),
      );
      if (!imagesResult.ok) {
        setBanner({ ok: false, message: imagesResult.error });
        setSaving(false);
        return;
      }
      const variantsResult = await saveProductVariants(
        productId,
        variants.map((v, i) => ({
          id: v.id,
          name: v.name,
          priceCents: inputToCents(v.price),
          isDefault: v.isDefault,
          isSoldOut: v.isSoldOut,
          sortOrder: i,
        })),
      );
      if (!variantsResult.ok) {
        setBanner({ ok: false, message: variantsResult.error });
        setSaving(false);
        return;
      }
    }

    setBanner({ ok: true, message: "Product saved." });
    setSaving(false);
    if (!product?.id && productId) {
      router.replace(`/admin/products/${productId}`);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <SaveBanner state={banner} />

      {/* Basics */}
      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Basics</h2>
        <div>
          <label htmlFor="pf-name" className="label">
            Name
          </label>
          <input
            id="pf-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-category" className="label">
              Category
            </label>
            <select
              id="pf-category"
              className="input"
              value={categoryId ?? ""}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pf-tags" className="label">
              Tags (comma separated)
            </label>
            <input
              id="pf-tags"
              className="input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bread, garlic, party"
            />
          </div>
        </div>
        <div>
          <label htmlFor="pf-short" className="label">
            Short description
          </label>
          <input
            id="pf-short"
            className="input"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pf-desc" className="label">
            Full description
          </label>
          <textarea
            id="pf-desc"
            rows={4}
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </section>

      {/* Pricing & inventory */}
      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Pricing & inventory</h2>
        <p className="text-sm text-cocoa-soft">
          Leave the price empty to show “Price coming soon” in the store — no
          made-up prices.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-price" className="label">
              Price (CAD)
            </label>
            <input
              id="pf-price"
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Leave empty if not set"
            />
          </div>
          <div>
            <label htmlFor="pf-compare" className="label">
              Compare-at price (CAD, optional)
            </label>
            <input
              id="pf-compare"
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pf-stock" className="label">
              Stock quantity (empty = untracked)
            </label>
            <input
              id="pf-stock"
              type="number"
              min="0"
              className="input"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pf-lowstock" className="label">
              Low-stock alert threshold
            </label>
            <input
              id="pf-lowstock"
              type="number"
              min="0"
              className="input"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pf-unit" className="label">
              Package size (e.g. 250 g tub)
            </label>
            <input
              id="pf-unit"
              className="input"
              value={unitLabel}
              onChange={(e) => setUnitLabel(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pf-pieces" className="label">
              Pieces per package
            </label>
            <input
              id="pf-pieces"
              type="number"
              min="0"
              className="input"
              value={piecesCount}
              onChange={(e) => setPiecesCount(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Food details */}
      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Food details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-spice" className="label">
              Spice level
            </label>
            <select
              id="pf-spice"
              className="input"
              value={spiceLevel}
              onChange={(e) => setSpiceLevel(e.target.value)}
            >
              <option value="">Not applicable</option>
              <option value="0">Not spicy</option>
              <option value="1">Mild</option>
              <option value="2">Medium</option>
              <option value="3">Hot</option>
            </select>
          </div>
          <div>
            <label htmlFor="pf-shelf" className="label">
              Shelf life (e.g. Best within 3 days)
            </label>
            <input
              id="pf-shelf"
              className="input"
              value={shelfLife}
              onChange={(e) => setShelfLife(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="pf-ingredients" className="label">
            Ingredients (comma separated)
          </label>
          <textarea
            id="pf-ingredients"
            rows={2}
            className="input"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pf-allergens" className="label">
            Allergens (comma separated)
          </label>
          <input
            id="pf-allergens"
            className="input"
            value={allergens}
            onChange={(e) => setAllergens(e.target.value)}
            placeholder="gluten, dairy, nuts"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-storage" className="label">
              Storage instructions
            </label>
            <textarea
              id="pf-storage"
              rows={2}
              className="input"
              value={storageInstructions}
              onChange={(e) => setStorageInstructions(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pf-serving" className="label">
              Serving / reheating
            </label>
            <textarea
              id="pf-serving"
              rows={2}
              className="input"
              value={servingInstructions}
              onChange={(e) => setServingInstructions(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Flags */}
      <section className="card flex flex-col gap-3 p-5">
        <h2 className="font-semibold">Visibility & flags</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            {
              label: "Published (visible in store)",
              value: isPublished,
              set: setIsPublished,
            },
            {
              label: "Featured on homepage",
              value: isFeatured,
              set: setIsFeatured,
            },
            { label: "Vegan", value: isVegan, set: setIsVegan },
            { label: "Vegetarian", value: isVegetarian, set: setIsVegetarian },
            { label: "Sold out", value: isSoldOut, set: setIsSoldOut },
            {
              label: "Available this week",
              value: availableThisWeek,
              set: setAvailableThisWeek,
            },
            {
              label: "Demo data (admin-only label)",
              value: isDemo,
              set: setIsDemo,
            },
          ].map((flag) => (
            <label key={flag.label} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={flag.value}
                onChange={(e) => flag.set(e.target.checked)}
              />
              {flag.label}
            </label>
          ))}
        </div>
      </section>

      {/* Images */}
      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Images</h2>
        <p className="text-sm text-cocoa-soft">
          The first image is the main one. Products without photos show an
          elegant branded placeholder in the store — never a broken image.
        </p>
        {images.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {images.map((img, i) => (
              <li
                key={`${img.url}-${i}`}
                className="flex items-center gap-3 rounded border border-cocoa/10 p-2"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded">
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <label className="sr-only" htmlFor={`pf-alt-${i}`}>
                    Alt text for image {i + 1}
                  </label>
                  <input
                    id={`pf-alt-${i}`}
                    className="input"
                    placeholder="Alt text (describe the photo)"
                    value={img.altText}
                    onChange={(e) =>
                      setImages((prev) =>
                        prev.map((row, j) =>
                          j === i ? { ...row, altText: e.target.value } : row,
                        ),
                      )
                    }
                  />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className="rounded p-1.5 hover:bg-cream"
                    onClick={() => moveImage(i, -1)}
                    aria-label="Move image up"
                    disabled={i === 0}
                  >
                    <ArrowUp size={14} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 hover:bg-cream"
                    onClick={() => moveImage(i, 1)}
                    aria-label="Move image down"
                    disabled={i === images.length - 1}
                  >
                    <ArrowDown size={14} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-terracotta hover:bg-terracotta-soft"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, j) => j !== i))
                    }
                    aria-label="Remove image"
                  >
                    <X size={14} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        <div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <UploadCloud size={16} aria-hidden />
            {uploading ? "Uploading…" : "Upload images"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              if (e.target.files?.length) void handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      {/* Variants */}
      <section className="card flex flex-col gap-4 p-5">
        <h2 className="font-semibold">Sizes & options</h2>
        <p className="text-sm text-cocoa-soft">
          Optional — e.g. Small / Large tubs, or box sizes. Leave a variant
          price empty if it isn&apos;t set yet.
        </p>
        {variants.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {variants.map((v, i) => (
              <li
                key={i}
                className="grid gap-2 rounded border border-cocoa/10 p-3 sm:grid-cols-[1fr_140px_auto_auto_auto]"
              >
                <div>
                  <label className="sr-only" htmlFor={`pf-vname-${i}`}>
                    Variant name
                  </label>
                  <input
                    id={`pf-vname-${i}`}
                    className="input"
                    placeholder="Name (e.g. Large)"
                    value={v.name}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((row, j) =>
                          j === i ? { ...row, name: e.target.value } : row,
                        ),
                      )
                    }
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor={`pf-vprice-${i}`}>
                    Variant price
                  </label>
                  <input
                    id={`pf-vprice-${i}`}
                    type="number"
                    step="0.01"
                    min="0"
                    className="input"
                    placeholder="Price (CAD)"
                    value={v.price}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((row, j) =>
                          j === i ? { ...row, price: e.target.value } : row,
                        ),
                      )
                    }
                  />
                </div>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="pf-default-variant"
                    checked={v.isDefault}
                    onChange={() =>
                      setVariants((prev) =>
                        prev.map((row, j) => ({ ...row, isDefault: j === i })),
                      )
                    }
                  />
                  Default
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={v.isSoldOut}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((row, j) =>
                          j === i
                            ? { ...row, isSoldOut: e.target.checked }
                            : row,
                        ),
                      )
                    }
                  />
                  Sold out
                </label>
                <button
                  type="button"
                  className="justify-self-start text-sm font-medium text-terracotta underline sm:justify-self-end"
                  onClick={() =>
                    setVariants((prev) => prev.filter((_, j) => j !== i))
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              setVariants((prev) => [
                ...prev,
                {
                  name: "",
                  price: "",
                  isDefault: prev.length === 0,
                  isSoldOut: false,
                },
              ])
            }
          >
            Add option
          </button>
        </div>
      </section>

      <div className="sticky bottom-4">
        <button
          type="button"
          className="btn-primary w-full shadow-lg sm:w-auto"
          onClick={() => void handleSave()}
          disabled={saving || !name.trim()}
        >
          {saving ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </div>
  );
}
