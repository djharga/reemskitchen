import "server-only";

/**
 * Stripe integration point (future).
 *
 * Online payment stays COMPLETELY hidden until BOTH are true:
 *  1. STRIPE_SECRET_KEY + NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY are set
 *     in the environment, and
 *  2. "Enable Stripe payments" is turned on in Admin -> Settings.
 *
 * There is deliberately no fake "Pay now" button anywhere. To go live:
 *  - npm install stripe @stripe/stripe-js
 *  - implement createPaymentIntent() below
 *  - add a webhook route (app/api/stripe/webhook/route.ts) that marks
 *    orders payment_status = 'paid' using STRIPE_WEBHOOK_SECRET
 */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  );
}

export async function createPaymentIntent(_args: {
  orderId: string;
  amountCents: number;
  currency: string;
}): Promise<never> {
  throw new Error(
    "Stripe is not implemented yet. See src/lib/payments/stripe.ts for setup steps.",
  );
}
