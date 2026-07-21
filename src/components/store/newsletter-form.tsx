"use client";

import { useFormState, useFormStatus } from "react-dom";
import { subscribeToNewsletter } from "@/app/actions/newsletter";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? "Joining…" : "Join"}
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useFormState(subscribeToNewsletter, null);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="input"
          autoComplete="email"
        />
        <SubmitButton />
      </div>
      {state ? (
        <p
          role="status"
          className={`text-sm ${state.ok ? "text-olive" : "text-terracotta"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
