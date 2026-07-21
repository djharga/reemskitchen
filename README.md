# Reem's Kitchen — Online Store

A fast, warm, mobile-first e-commerce site for **Reem's Kitchen**, a Calgary brand selling
handmade Middle Eastern food and baked goods at local farmers' markets.

- **Storefront**: home, shop with filters & instant search, product pages, side cart,
  checkout with pickup location/date selection, Find Us, About/FAQ/policies, order
  confirmation & lookup, newsletter signup.
- **Admin panel** (`/admin`): dashboard, products (multi-image upload & ordering, variants,
  inventory), categories, pickup locations, market schedule, orders (statuses, print, CSV
  export), customers, content (hero, story, FAQ, policies), settings (contact info, payments,
  SEO, brand color tokens).
- **Stack**: Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth,
  Storage, RLS) · React Hook Form · Zod · Server Actions.

Everything editable — texts, prices, images, phone/WhatsApp, locations, market dates,
payment methods, colors — lives in the database and is managed from the admin panel.
Nothing is hard-coded.

---

## 1. Requirements

- Node.js 18.17+ (or 20+ recommended)
- npm (or pnpm/yarn)
- A free [Supabase](https://supabase.com) project

## 2. Set up Supabase

1. Create a new Supabase project.
2. In the Supabase dashboard, open **SQL Editor** and run these files **in order**:
   1. `supabase/migrations/0001_schema.sql` — tables, triggers, RLS policies, storage buckets.
   2. `supabase/migrations/0002_seed.sql` — settings row, homepage content, 6 categories and
      16 demo products (all flagged `is_demo`, all prices intentionally empty).
   3. `supabase/migrations/0003_align_columns.sql` — **only for databases created with an
      older copy of `0001_schema.sql`** (renames `is_active`→`is_published` on products,
      `hours_note`→`hours_text` on locations, and updates `site_settings` columns).
      Fresh installs of the current schema can skip this file.
3. Storage buckets (`product-images`, `category-images`, `location-images`, `brand`) are
   created by the schema migration with public-read / admin-write policies.

## 3. Environment variables

Copy the example file and fill it in:

```bash
cp .env.example .env.local
```

| Variable                             | Where to find it                                   | Required          |
| ------------------------------------ | -------------------------------------------------- | ----------------- |
| `NEXT_PUBLIC_SUPABASE_URL`           | Supabase → Settings → API → Project URL            | Yes               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Supabase → Settings → API → anon public key        | Yes               |
| `SUPABASE_SERVICE_ROLE_KEY`          | Supabase → Settings → API → service_role key       | Yes (server only) |
| `NEXT_PUBLIC_SITE_URL`               | Your deployed URL (e.g. `https://reemskitchen.ca`) | Yes for SEO       |
| `STRIPE_SECRET_KEY`                  | Stripe dashboard (later)                           | No                |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard (later)                           | No                |
| `STRIPE_WEBHOOK_SECRET`              | Stripe dashboard (later)                           | No                |

> The service-role key is only ever used inside server code (`src/lib/supabase/admin.ts`,
> guarded with `server-only`). It is never shipped to the browser. Never commit `.env.local`.

## 4. Run the project

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the storefront works immediately with the seeded demo catalog.

## 5. Create the admin account

1. In Supabase → **Authentication → Users**, click **Add user** and create a user with an
   email + password (confirm the email automatically).
2. A `profiles` row is created automatically. Grant it the admin role — run in SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where id = '<the-user-uuid>';
   ```

3. Sign in at `/admin/login`. (Use role `'staff'` for helpers who manage orders.)

## 6. Everyday tasks (admin panel)

| Task                   | Where                                                                                                                                                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Add / edit products    | **Products** → Add product. Demo rows are labelled “Demo data” (admins only — customers never see the word Demo). Replace or delete them.                                                                             |
| Upload product images  | Open a product → **Images** → Upload. Reorder with the arrows; the first image is the main one. Products without photos show an elegant branded placeholder — never a broken image.                                   |
| Add prices             | Open a product → **Pricing & inventory**. Leave empty to show “Price coming soon”; add variant prices for sizes (e.g. Small/Large).                                                                                   |
| Sizes & options        | Product → **Sizes & options** (variants with their own price / sold-out flag).                                                                                                                                        |
| Add pickup locations   | **Locations** → Add location (name, address, map link, hours, pickup instructions, photo).                                                                                                                            |
| Schedule a market      | **Market Schedule** → Add market date (location, date, hours, pre-order deadline, max orders, available products). Published dates power the homepage “This Week at the Market”, the Find Us page and checkout slots. |
| Manage orders          | **Orders** — filter by status, open an order to update status (New → Confirmed → Preparing → Ready for Pickup → Completed), print a summary, or **Export CSV**.                                                       |
| Contact info & socials | **Settings** — phone, WhatsApp, email, Instagram. Empty fields simply don't appear in the store.                                                                                                                      |
| Homepage texts & story | **Content** — hero, Reem's story, bundles text, FAQ, policies. Announcement bar text/link is in **Settings**.                                                                                                         |
| Brand colors           | **Settings → Brand colors** — the design tokens restyle the whole site instantly.                                                                                                                                     |

## 7. Connecting Stripe later

The checkout is Stripe-ready but honest: it never shows a fake online-payment button.

1. Add `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and
   `STRIPE_WEBHOOK_SECRET` to your environment.
2. Turn on **Settings → Stripe online payment enabled** in the admin panel.
3. Implement the payment intent flow in `src/lib/payments/stripe.ts` (the integration point
   is isolated there); until then, checkout offers **Pay at pickup** only.

## 8. Architecture notes

```
src/
  app/
    (store)/        # Public storefront (home, shop, product, checkout, find-us, about, order)
    admin/
      login/        # Ungated sign-in page
      (panel)/      # Auth + role-gated admin panel
    actions/        # Server actions (orders, newsletter, auth, admin CRUD, image upload)
    sitemap.ts, robots.ts
  components/
    store/          # Header, cart drawer, product cards, filters, checkout form…
    admin/          # Forms, image upload, order actions…
    seo/            # JSON-LD (LocalBusiness, Product, Breadcrumb, FAQ)
  lib/
    supabase/       # Browser / server / service-role clients + session middleware
    i18n/           # Locale scaffolding (en active; ar RTL & fr ready, hidden until translated)
    queries.ts, validation.ts (Zod), utils.ts, types.ts
supabase/migrations/  # 0001 schema + RLS, 0002 seed, 0003 column alignment
```

- **Security**: RLS on every table (public sees only published data; writes require the
  admin/staff role), server-side re-validation of every order (prices are recomputed from the
  DB, never trusted from the client), middleware + layout + per-action role checks for `/admin`.
- **Honest data**: no invented prices, phones or addresses anywhere — empty data hides the
  field or shows a friendly placeholder/empty state instead.
- **Extensibility**: isolated integration points for Stripe, Google Maps/Reviews, WhatsApp
  ordering, email/SMS notifications, loyalty, delivery and full i18n.
