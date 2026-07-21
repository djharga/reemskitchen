import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderForConfirmation } from "@/app/actions/orders";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

/**
 * Lightweight account page: staff are routed to the admin panel, and
 * customers can look up an order with order number + email (no account
 * required to shop — pre-orders stay friction-free).
 */
export default async function AccountPage({
  searchParams,
}: {
  searchParams: { order?: string; email?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile && ["admin", "staff"].includes(profile.role)) {
      redirect("/admin");
    }
  }

  const orderNumber = searchParams.order?.trim();
  const email = searchParams.email?.trim();
  const order =
    orderNumber && email
      ? await getOrderForConfirmation(orderNumber, email)
      : null;
  const searched = Boolean(orderNumber && email);

  return (
    <div className="container-rk max-w-lg py-12 sm:py-16">
      <h1 className="font-display text-3xl font-semibold">Your orders</h1>
      <p className="mt-2 text-cocoa-soft">
        No account needed — look up any order with your order number and the
        email you used at checkout.
      </p>

      <form method="get" className="card mt-6 flex flex-col gap-4 p-5">
        <div>
          <label htmlFor="acc-order" className="label">
            Order number
          </label>
          <input
            id="acc-order"
            name="order"
            className="input"
            placeholder="RK-260721-0001"
            defaultValue={orderNumber ?? ""}
            required
          />
        </div>
        <div>
          <label htmlFor="acc-email" className="label">
            Email
          </label>
          <input
            id="acc-email"
            name="email"
            type="email"
            className="input"
            defaultValue={email ?? ""}
            required
          />
        </div>
        <button type="submit" className="btn-primary">
          Find my order
        </button>
      </form>

      {searched && !order ? (
        <p
          role="alert"
          className="mt-4 rounded bg-terracotta-soft px-4 py-3 text-sm font-medium text-terracotta"
        >
          We couldn&apos;t find an order with that number and email.
          Double-check both and try again.
        </p>
      ) : null}

      {order ? (
        <div className="card mt-4 p-5">
          <p className="font-semibold">
            Order {order.order_number} —{" "}
            <span className="capitalize">
              {order.status.replace(/_/g, " ")}
            </span>
          </p>
          <Link
            href={`/order/${order.order_number}?email=${encodeURIComponent(order.email)}`}
            className="btn-secondary mt-3"
          >
            View full order details
          </Link>
        </div>
      ) : null}

      <p className="mt-8 text-sm text-cocoa-soft">
        Are you the store owner?{" "}
        <Link
          href="/admin/login"
          className="font-medium text-lavender-deep underline"
        >
          Sign in to the admin panel
        </Link>
      </p>
    </div>
  );
}
