"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Location, MarketSchedule } from "@/lib/types";
import { deleteSchedule, saveSchedule } from "@/app/actions/admin";
import { DeleteButton, SaveBanner } from "./ui";

type ProductOption = { id: string; name: string };

export function ScheduleForm({
  schedule,
  locations,
  products,
}: {
  schedule: MarketSchedule | null;
  locations: Location[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [locationId, setLocationId] = useState(schedule?.location_id ?? "");
  const [marketDate, setMarketDate] = useState(schedule?.market_date ?? "");
  const [startTime, setStartTime] = useState(
    schedule?.start_time?.slice(0, 5) ?? "09:00",
  );
  const [endTime, setEndTime] = useState(
    schedule?.end_time?.slice(0, 5) ?? "14:00",
  );
  const [preorderDeadline, setPreorderDeadline] = useState(
    schedule?.preorder_deadline ? schedule.preorder_deadline.slice(0, 16) : "",
  );
  const [maxOrders, setMaxOrders] = useState(
    schedule?.max_orders !== null && schedule?.max_orders !== undefined
      ? String(schedule.max_orders)
      : "",
  );
  const [isPublished, setIsPublished] = useState(
    schedule?.is_published ?? true,
  );
  const [productIds, setProductIds] = useState<string[]>(
    (schedule?.market_products ?? []).map((mp) => mp.product_id),
  );

  async function handleSave() {
    setSaving(true);
    setBanner(null);
    const result = await saveSchedule(
      {
        locationId,
        marketDate,
        startTime,
        endTime,
        preorderDeadline: preorderDeadline
          ? new Date(preorderDeadline).toISOString()
          : null,
        maxOrders: maxOrders.trim() ? Number(maxOrders) : null,
        isPublished,
        productIds,
      },
      schedule?.id,
    );
    setBanner(
      result.ok
        ? { ok: true, message: "Market date saved." }
        : { ok: false, message: result.error },
    );
    setSaving(false);
    if (result.ok) {
      router.push("/admin/schedule");
      router.refresh();
    }
  }

  return (
    <div className="card flex max-w-xl flex-col gap-4 p-5">
      <SaveBanner state={banner} />
      <div>
        <label htmlFor="sf-location" className="label">
          Location
        </label>
        <select
          id="sf-location"
          className="input"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        >
          <option value="">Choose a location…</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        {locations.length === 0 ? (
          <p className="mt-1 text-xs text-terracotta">
            Add a pickup location first.
          </p>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="sf-date" className="label">
            Market date
          </label>
          <input
            id="sf-date"
            type="date"
            className="input"
            value={marketDate}
            onChange={(e) => setMarketDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-start" className="label">
            Start
          </label>
          <input
            id="sf-start"
            type="time"
            className="input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-end" className="label">
            End
          </label>
          <input
            id="sf-end"
            type="time"
            className="input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sf-deadline" className="label">
            Pre-order deadline (optional)
          </label>
          <input
            id="sf-deadline"
            type="datetime-local"
            className="input"
            value={preorderDeadline}
            onChange={(e) => setPreorderDeadline(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sf-max" className="label">
            Max orders (optional)
          </label>
          <input
            id="sf-max"
            type="number"
            min="1"
            className="input"
            value={maxOrders}
            onChange={(e) => setMaxOrders(e.target.value)}
            placeholder="No limit"
          />
        </div>
      </div>
      <fieldset>
        <legend className="label">Products available at this market</legend>
        <p className="mb-2 text-xs text-cocoa-soft">
          Leave all unchecked to make every published product available.
        </p>
        <div className="grid max-h-56 gap-1.5 overflow-y-auto rounded border border-cocoa/10 p-3 sm:grid-cols-2">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={productIds.includes(p.id)}
                onChange={(e) =>
                  setProductIds((prev) =>
                    e.target.checked
                      ? [...prev, p.id]
                      : prev.filter((id) => id !== p.id),
                  )
                }
              />
              {p.name}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        Published (visible in store & checkout)
      </label>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-primary"
          onClick={() => void handleSave()}
          disabled={saving || !locationId || !marketDate}
        >
          {saving ? "Saving…" : schedule ? "Save changes" : "Add market date"}
        </button>
        {schedule ? (
          <DeleteButton
            confirmText="Delete this market date? Orders pointing to it keep their data."
            onDelete={() => deleteSchedule(schedule.id)}
          />
        ) : null}
      </div>
    </div>
  );
}
