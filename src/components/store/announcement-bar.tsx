import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

/** Editable from Admin -> Settings. Hidden entirely when no message is set. */
export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  if (!settings.announcement_text) return null;
  const href = settings.announcement_href || "/find-us";
  return (
    <Link
      href={href}
      className="block bg-lavender-deep px-4 py-2 text-center text-sm font-medium text-white hover:opacity-95"
    >
      {settings.announcement_text}
      <span aria-hidden className="ms-2">
        →
      </span>
    </Link>
  );
}
