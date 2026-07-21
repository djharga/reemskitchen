"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Category } from "@/lib/types";
import { deleteCategory, saveCategory } from "@/app/actions/admin";
import { ImageUpload } from "./image-upload";
import { DeleteButton, SaveBanner } from "./ui";

export function CategoryForm({ category }: { category: Category | null }) {
  const router = useRouter();
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    category?.image_url ?? null,
  );
  const [sortOrder, setSortOrder] = useState(String(category?.sort_order ?? 0));
  const [isVisible, setIsVisible] = useState(category?.is_visible ?? true);

  async function handleSave() {
    setSaving(true);
    setBanner(null);
    const result = await saveCategory(
      {
        name,
        slug: category?.slug ?? "",
        description,
        imageUrl,
        sortOrder: Number(sortOrder) || 0,
        isVisible,
      },
      category?.id,
    );
    setBanner(
      result.ok
        ? { ok: true, message: "Category saved." }
        : { ok: false, message: result.error },
    );
    setSaving(false);
    if (result.ok) {
      router.push("/admin/categories");
      router.refresh();
    }
  }

  return (
    <div className="card flex max-w-xl flex-col gap-4 p-5">
      <SaveBanner state={banner} />
      <div>
        <label htmlFor="cf-name" className="label">
          Name
        </label>
        <input
          id="cf-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="cf-desc" className="label">
          Description (shown on the category page)
        </label>
        <textarea
          id="cf-desc"
          rows={2}
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <ImageUpload
        bucket="category-images"
        value={imageUrl}
        onChange={setImageUrl}
        label="Category image"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-order" className="label">
            Sort order (lower shows first)
          </label>
          <input
            id="cf-order"
            type="number"
            className="input"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
          />
          Visible in store
        </label>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-primary"
          onClick={() => void handleSave()}
          disabled={saving || !name.trim()}
        >
          {saving ? "Saving…" : category ? "Save changes" : "Create category"}
        </button>
        {category ? (
          <DeleteButton
            confirmText={`Delete "${category.name}"? Products in it will become uncategorized.`}
            onDelete={() => deleteCategory(category.id)}
          />
        ) : null}
      </div>
    </div>
  );
}
