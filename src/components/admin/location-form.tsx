"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Location } from "@/lib/types";
import { deleteLocation, saveLocation } from "@/app/actions/admin";
import { ImageUpload } from "./image-upload";
import { DeleteButton, SaveBanner } from "./ui";

export function LocationForm({ location }: { location: Location | null }) {
  const router = useRouter();
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(location?.name ?? "");
  const [address, setAddress] = useState(location?.address ?? "");
  const [mapUrl, setMapUrl] = useState(location?.map_url ?? "");
  const [phone, setPhone] = useState(location?.phone ?? "");
  const [hoursText, setHoursText] = useState(location?.hours_text ?? "");
  const [pickupInstructions, setPickupInstructions] = useState(
    location?.pickup_instructions ?? "",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    location?.image_url ?? null,
  );
  const [isActive, setIsActive] = useState(location?.is_active ?? true);

  async function handleSave() {
    setSaving(true);
    setBanner(null);
    const result = await saveLocation(
      {
        name,
        address,
        mapUrl,
        phone,
        hoursText,
        pickupInstructions,
        imageUrl,
        isActive,
      },
      location?.id,
    );
    setBanner(
      result.ok
        ? { ok: true, message: "Location saved." }
        : { ok: false, message: result.error },
    );
    setSaving(false);
    if (result.ok) {
      router.push("/admin/locations");
      router.refresh();
    }
  }

  return (
    <div className="card flex max-w-xl flex-col gap-4 p-5">
      <SaveBanner state={banner} />
      <div>
        <label htmlFor="lf-name" className="label">
          Name (e.g. Crossroads Market)
        </label>
        <input
          id="lf-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="lf-address" className="label">
          Address
        </label>
        <input
          id="lf-address"
          className="input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="lf-map" className="label">
            Google Maps link
          </label>
          <input
            id="lf-map"
            type="url"
            className="input"
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            placeholder="https://maps.google.com/…"
          />
        </div>
        <div>
          <label htmlFor="lf-phone" className="label">
            Phone (optional)
          </label>
          <input
            id="lf-phone"
            type="tel"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="lf-hours" className="label">
          Hours (e.g. Sat & Sun 9am–5pm)
        </label>
        <input
          id="lf-hours"
          className="input"
          value={hoursText}
          onChange={(e) => setHoursText(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="lf-pickup" className="label">
          Pickup instructions
        </label>
        <textarea
          id="lf-pickup"
          rows={3}
          className="input"
          value={pickupInstructions}
          onChange={(e) => setPickupInstructions(e.target.value)}
          placeholder="e.g. Find our stall near the north entrance; mention your order number."
        />
      </div>
      <ImageUpload
        bucket="location-images"
        value={imageUrl}
        onChange={setImageUrl}
        label="Location photo"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Active (can be used for market dates)
      </label>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="btn-primary"
          onClick={() => void handleSave()}
          disabled={saving || !name.trim()}
        >
          {saving ? "Saving…" : location ? "Save changes" : "Create location"}
        </button>
        {location ? (
          <DeleteButton
            confirmText={`Delete "${location.name}"? Its market dates will also be removed.`}
            onDelete={() => deleteLocation(location.id)}
          />
        ) : null}
      </div>
    </div>
  );
}
