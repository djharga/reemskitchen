"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ActionResult } from "@/app/actions/admin";

/** Small shared client widgets for the admin panel. */

export function DeleteButton({
  label = "Delete",
  confirmText,
  onDelete,
}: {
  label?: string;
  confirmText: string;
  onDelete: () => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        className="text-sm font-medium text-terracotta underline disabled:opacity-50"
        disabled={busy}
        onClick={async () => {
          if (!window.confirm(confirmText)) return;
          setBusy(true);
          setError(null);
          const result = await onDelete();
          if (result.ok) {
            router.refresh();
          } else {
            setError(result.error);
            setBusy(false);
          }
        }}
      >
        {busy ? "Deleting…" : label}
      </button>
      {error ? (
        <span role="alert" className="text-xs text-terracotta">
          {error}
        </span>
      ) : null}
    </span>
  );
}

export function SaveBanner({
  state,
}: {
  state: { ok: boolean; message: string } | null;
}) {
  if (!state) return null;
  return (
    <p
      role="alert"
      className={`rounded px-3 py-2 text-sm font-medium ${
        state.ok
          ? "bg-olive-soft text-olive"
          : "bg-terracotta-soft text-terracotta"
      }`}
    >
      {state.message}
    </p>
  );
}
