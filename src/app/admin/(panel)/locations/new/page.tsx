import Link from "next/link";
import { LocationForm } from "@/components/admin/location-form";

export default function NewLocationPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/locations"
          className="text-sm text-lavender-deep underline"
        >
          ← Back to locations
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold">
          Add location
        </h1>
      </div>
      <LocationForm location={null} />
    </div>
  );
}
