"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateCustomerNote } from "@/app/actions/admin";

export function CustomerNote({
  customerId,
  note,
}: {
  customerId: string;
  note: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(note ?? "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <label
        htmlFor={`cnote-${customerId}`}
        className="mb-2 block text-sm font-semibold"
      >
        Notes
      </label>
      <textarea
        id={`cnote-${customerId}`}
        rows={3}
        className="input"
        value={value}
        placeholder="e.g. Prefers gluten-free, always picks up early…"
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary !min-h-0 !py-1.5"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const result = await updateCustomerNote(customerId, value);
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
