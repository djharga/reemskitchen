import type { Metadata } from "next";
import { getSettings, getUpcomingSchedules } from "@/lib/queries";
import { isPreorderOpen } from "@/lib/utils";
import { CheckoutForm } from "@/components/store/checkout-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const [settings, schedules] = await Promise.all([
    getSettings(),
    getUpcomingSchedules(6),
  ]);
  const openSchedules = schedules.filter(isPreorderOpen);

  const stripeEnabled =
    settings.payment_stripe_enabled &&
    Boolean(process.env.STRIPE_SECRET_KEY) &&
    Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <div className="container-rk py-8 sm:py-12">
      <h1 className="font-display text-3xl font-semibold">Checkout</h1>
      <p className="mb-6 mt-1 text-cocoa-soft">
        Pre-order now and pick up fresh at the market.
      </p>
      <CheckoutForm
        schedules={openSchedules}
        stripeEnabled={stripeEnabled}
        discountsEnabled={settings.discounts_enabled}
      />
    </div>
  );
}
