"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn, type AuthState } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, action] = useFormState<AuthState, FormData>(signIn, {
    error: null,
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="card w-full max-w-sm p-6 sm:p-8">
        <h1 className="font-display text-2xl font-semibold">
          Reem&apos;s Kitchen Admin
        </h1>
        <p className="mt-1 text-sm text-cocoa-soft">
          Sign in to manage your store.
        </p>
        <form action={action} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="login-email" className="label">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="input"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="label">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="input"
              autoComplete="current-password"
              required
            />
          </div>
          {state.error ? (
            <p
              role="alert"
              className="rounded bg-terracotta-soft px-3 py-2 text-sm font-medium text-terracotta"
            >
              {state.error}
            </p>
          ) : null}
          <SubmitButton />
        </form>
        <p className="mt-4 text-xs text-cocoa-soft">
          Admin accounts are created in Supabase — see the README for setup
          steps.
        </p>
      </div>
    </div>
  );
}
