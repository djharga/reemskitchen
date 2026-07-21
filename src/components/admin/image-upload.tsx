"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { uploadImage } from "@/app/actions/admin";

/**
 * Uploads a single image through a server action (service keys never touch
 * the browser) and reports the public URL back to the parent form.
 */
export function ImageUpload({
  bucket,
  value,
  onChange,
  label = "Image",
}: {
  bucket: "product-images" | "category-images" | "location-images" | "brand";
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    const formData = new FormData();
    formData.set("bucket", bucket);
    formData.set("file", file);
    const result = await uploadImage(formData);
    if (result.ok) {
      onChange(result.url);
    } else {
      setError(result.error);
    }
    setBusy(false);
  }

  return (
    <div>
      <p className="label">{label}</p>
      {value ? (
        <div className="relative inline-block">
          <div className="relative h-28 w-28 overflow-hidden rounded border border-cocoa/15">
            <Image
              src={value}
              alt=""
              fill
              sizes="112px"
              className="object-cover"
            />
          </div>
          <button
            type="button"
            className="absolute -right-2 -top-2 rounded-full bg-terracotta p-1 text-white"
            onClick={() => onChange(null)}
            aria-label="Remove image"
          >
            <X size={12} aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded border border-dashed border-cocoa/30 bg-white text-xs text-cocoa-soft hover:border-cocoa/60 disabled:opacity-50"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <UploadCloud size={18} aria-hidden />
          {busy ? "Uploading…" : "Upload"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {error ? (
        <p role="alert" className="mt-1 text-xs text-terracotta">
          {error}
        </p>
      ) : null}
    </div>
  );
}
