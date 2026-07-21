"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@/lib/types";
import { updateOrderAdminNote, updateOrderStatus } from "@/app/actions/admin";

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready_for_pickup", label: "Ready for Pickup" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center gap-2">
      <label className="sr-only" htmlFor={`status-${orderId}`}>
        Order status
      </label>
      <select
        id={`status-${orderId}`}
        className="input !w-auto !min-h-0 !py-1.5 text-sm"
        defaultValue={status}
        disabled={busy}
        onChange={async (e) => {
          setBusy(true);
          setError(null);
          const result = await updateOrderStatus(
            orderId,
            e.target.value as OrderStatus,
          );
          if (!result.ok) setError(result.error);
          setBusy(false);
          router.refresh();
        }}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <span role="alert" className="text-xs text-terracotta">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export function OrderAdminNote({
  orderId,
  note,
}: {
  orderId: string;
  note: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(note ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`note-${orderId}`} className="label">
        Internal note (not visible to the customer)
      </label>
      <textarea
        id={`note-${orderId}`}
        rows={2}
        className="input"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary !min-h-0 !py-1.5"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const result = await updateOrderAdminNote(orderId, value);
            setSaved(result.ok);
            setBusy(false);
            router.refresh();
          }}
        >
          {busy ? "Saving…" : "Save note"}
        </button>
        {saved ? <span className="text-xs text-olive">Saved</span> : null}
      </div>
    </div>
  );
}

export function PrintButton() {
  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={() => window.print()}
    >
      Print order summary
    </button>
  );
}
