"use client";

import { useState } from "react";
import type { ContentBlock } from "@/lib/types";
import { saveContentBlock } from "@/app/actions/admin";
import { ImageUpload } from "./image-upload";
import { SaveBanner } from "./ui";

type FaqItem = { q: string; a: string };

/** Editor for one content block (hero, story, custom orders, FAQ, policies). */
export function ContentBlockEditor({
  blockKey,
  heading,
  description,
  block,
  withImage = false,
  withFaq = false,
  extraFields = [],
}: {
  blockKey: string;
  heading: string;
  description?: string;
  block?: ContentBlock;
  withImage?: boolean;
  withFaq?: boolean;
  extraFields?: Array<{ key: string; label: string; placeholder?: string }>;
}) {
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(block?.title ?? "");
  const [body, setBody] = useState(block?.body ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    block?.image_url ?? null,
  );
  const initialExtra = (block?.extra ?? {}) as Record<string, unknown>;
  const [extraValues, setExtraValues] = useState<Record<string, string>>(
    Object.fromEntries(
      extraFields.map((f) => [f.key, String(initialExtra[f.key] ?? "")]),
    ),
  );
  const [faqItems, setFaqItems] = useState<FaqItem[]>(
    withFaq ? ((initialExtra.items as FaqItem[] | undefined) ?? []) : [],
  );

  async function handleSave() {
    setSaving(true);
    setBanner(null);
    const extra: Record<string, unknown> = { ...initialExtra };
    for (const f of extraFields) {
      extra[f.key] = extraValues[f.key] || null;
    }
    if (withFaq) {
      extra.items = faqItems.filter((i) => i.q.trim() && i.a.trim());
    }
    const result = await saveContentBlock(blockKey, {
      title: title || null,
      body: body || null,
      imageUrl,
      extra,
    });
    setBanner(
      result.ok
        ? { ok: true, message: "Saved." }
        : { ok: false, message: result.error },
    );
    setSaving(false);
  }

  return (
    <section className="card flex flex-col gap-4 p-5" aria-label={heading}>
      <div>
        <h2 className="font-semibold">{heading}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-cocoa-soft">{description}</p>
        ) : null}
      </div>
      <SaveBanner state={banner} />
      <div>
        <label htmlFor={`cb-title-${blockKey}`} className="label">
          Title
        </label>
        <input
          id={`cb-title-${blockKey}`}
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`cb-body-${blockKey}`} className="label">
          Text
        </label>
        <textarea
          id={`cb-body-${blockKey}`}
          rows={5}
          className="input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
      {extraFields.map((f) => (
        <div key={f.key}>
          <label htmlFor={`cb-extra-${blockKey}-${f.key}`} className="label">
            {f.label}
          </label>
          <input
            id={`cb-extra-${blockKey}-${f.key}`}
            className="input"
            placeholder={f.placeholder}
            value={extraValues[f.key] ?? ""}
            onChange={(e) =>
              setExtraValues((prev) => ({ ...prev, [f.key]: e.target.value }))
            }
          />
        </div>
      ))}
      {withImage ? (
        <ImageUpload
          bucket="brand"
          value={imageUrl}
          onChange={setImageUrl}
          label="Image"
        />
      ) : null}
      {withFaq ? (
        <div className="flex flex-col gap-3">
          <p className="label !mb-0">FAQ items</p>
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded border border-cocoa/10 p-3"
            >
              <label className="sr-only" htmlFor={`faq-q-${i}`}>
                Question {i + 1}
              </label>
              <input
                id={`faq-q-${i}`}
                className="input"
                placeholder="Question"
                value={item.q}
                onChange={(e) =>
                  setFaqItems((prev) =>
                    prev.map((row, j) =>
                      j === i ? { ...row, q: e.target.value } : row,
                    ),
                  )
                }
              />
              <label className="sr-only" htmlFor={`faq-a-${i}`}>
                Answer {i + 1}
              </label>
              <textarea
                id={`faq-a-${i}`}
                rows={2}
                className="input"
                placeholder="Answer"
                value={item.a}
                onChange={(e) =>
                  setFaqItems((prev) =>
                    prev.map((row, j) =>
                      j === i ? { ...row, a: e.target.value } : row,
                    ),
                  )
                }
              />
              <button
                type="button"
                className="self-start text-sm font-medium text-terracotta underline"
                onClick={() =>
                  setFaqItems((prev) => prev.filter((_, j) => j !== i))
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-secondary self-start"
            onClick={() => setFaqItems((prev) => [...prev, { q: "", a: "" }])}
          >
            Add FAQ item
          </button>
        </div>
      ) : null}
      <div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </section>
  );
}
