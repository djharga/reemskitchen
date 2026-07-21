import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  MapPin,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: { default: "Admin — Reem's Kitchen", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/schedule", label: "Market Schedule", icon: CalendarDays },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

/**
 * Auth gate for every admin page (the login page lives outside this route
 * group). Middleware blocks unauthenticated requests early; this layout
 * re-verifies the session AND the admin/staff role server-side.
 */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "staff"].includes(profile.role)) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <aside className="shrink-0 border-b border-cocoa/10 bg-white lg:w-60 lg:border-b-0 lg:border-r">
          <div className="px-4 py-4">
            <Link
              href="/admin"
              className="font-display text-lg font-semibold text-lavender-deep"
            >
              Reem&apos;s Kitchen
            </Link>
            <p className="text-xs text-cocoa-soft">Store admin</p>
          </div>
          <nav
            aria-label="Admin navigation"
            className="overflow-x-auto px-2 pb-3 lg:pb-4"
          >
            <ul className="flex gap-1 lg:flex-col">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2.5 whitespace-nowrap rounded px-3 py-2 text-sm font-medium text-cocoa hover:bg-cream"
                  >
                    <item.icon size={16} aria-hidden />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-cocoa/10 px-4 py-3">
            <p className="truncate text-xs text-cocoa-soft">{user.email}</p>
            <div className="mt-2 flex items-center gap-3">
              <Link
                href="/"
                className="text-xs font-medium text-lavender-deep underline"
              >
                View store
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="text-xs font-medium text-terracotta underline"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
