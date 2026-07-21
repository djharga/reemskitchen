"use client";

import { deleteProduct } from "@/app/actions/admin";
import { DeleteButton } from "./ui";

export function ProductDeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <DeleteButton
      confirmText={`Delete "${name}"? This cannot be undone.`}
      onDelete={() => deleteProduct(id)}
    />
  );
}
