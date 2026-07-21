-- ============================================================
-- Reem's Kitchen — Supabase schema
-- Run this first (SQL editor or `supabase db push`).
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Helpers
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ------------------------------------------------------------
-- profiles (admin/staff identity, linked to Supabase Auth)
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('admin', 'staff', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- is_admin(): used by RLS policies. SECURITY DEFINER avoids recursive RLS.
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$;

-- ------------------------------------------------------------
-- categories
-- ------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  -- Prices are stored in cents (CAD) and are NULLABLE on purpose:
  -- when null the storefront shows "Price coming soon" / "Contact for price".
  price_cents int check (price_cents is null or price_cents >= 0),
  compare_at_price_cents int check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  unit_label text,              -- e.g. "500 g tub", "pack of 6"
  pieces_count int,             -- e.g. 6 pieces
  spice_level int check (spice_level is null or spice_level between 0 and 3),
  ingredients text[],
  allergens text[],
  storage_instructions text,
  serving_instructions text,    -- reheating / serving
  shelf_life text,
  is_vegan boolean not null default false,
  is_vegetarian boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  is_sold_out boolean not null default false,
  available_this_week boolean not null default true,
  -- stock_quantity null = "not tracked" (made fresh per market)
  stock_quantity int check (stock_quantity is null or stock_quantity >= 0),
  low_stock_threshold int not null default 5,
  tags text[],
  -- Demo flag: shown ONLY inside the admin panel, never to customers.
  is_demo boolean not null default false,
  sales_count int not null default 0, -- denormalized for "best sellers" sort
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_category on public.products (category_id);
create index idx_products_active on public.products (is_active);
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,            -- public storage URL
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_product_images_product on public.product_images (product_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,           -- e.g. "Small", "Large", "Box of 12"
  price_cents int check (price_cents is null or price_cents >= 0),
  stock_quantity int check (stock_quantity is null or stock_quantity >= 0),
  is_sold_out boolean not null default false,
  is_default boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_product_variants_product on public.product_variants (product_id);

-- ------------------------------------------------------------
-- pickup locations & market schedule
-- ------------------------------------------------------------
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  map_url text,
  phone text,
  image_url text,
  hours_note text,              -- e.g. "Saturdays 9am-2pm"
  pickup_instructions text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_locations_updated before update on public.locations
  for each row execute function public.set_updated_at();

create table public.market_schedules (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  market_date date not null,
  start_time time not null,
  end_time time not null,
  preorder_deadline timestamptz,
  max_orders int check (max_orders is null or max_orders > 0),
  notes text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_schedules_date on public.market_schedules (market_date);
create trigger trg_schedules_updated before update on public.market_schedules
  for each row execute function public.set_updated_at();

-- products available at a given market date
create table public.market_products (
  schedule_id uuid not null references public.market_schedules (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  primary key (schedule_id, product_id)
);

-- ------------------------------------------------------------
-- customers & orders
-- ------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_customers_updated before update on public.customers
  for each row execute function public.set_updated_at();

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers (id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text,
  location_id uuid references public.locations (id) on delete set null,
  schedule_id uuid references public.market_schedules (id) on delete set null,
  pickup_date date,
  pickup_time text,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'preparing', 'ready_for_pickup', 'completed', 'cancelled')),
  payment_method text not null default 'pay_at_pickup'
    check (payment_method in ('pay_at_pickup', 'stripe')),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'refunded')),
  subtotal_cents int not null default 0,
  discount_cents int not null default 0,
  total_cents int not null default 0,
  has_unpriced_items boolean not null default false,
  discount_code text,
  customer_notes text,
  admin_notes text,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_orders_status on public.orders (status);
create index idx_orders_pickup_date on public.orders (pickup_date);
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,   -- snapshot at time of order
  variant_name text,
  unit_price_cents int,         -- null = price to be confirmed
  quantity int not null check (quantity > 0),
  line_total_cents int
);
create index idx_order_items_order on public.order_items (order_id);

-- ------------------------------------------------------------
-- reviews, discounts, settings, content, newsletter
-- ------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  body text,
  source text not null default 'site' check (source in ('site', 'google')),
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  kind text not null default 'percent' check (kind in ('percent', 'fixed')),
  value int not null check (value > 0), -- percent (1-100) or cents
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses int,
  used_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Singleton settings row (id is always 1).
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'Reem''s Kitchen',
  tagline text,
  logo_url text,
  email text,
  phone text,
  whatsapp text,               -- number in international format, no +
  instagram_url text,
  facebook_url text,
  currency text not null default 'CAD',
  tax_rate numeric(5,4) not null default 0, -- e.g. 0.05 for GST if applicable
  payment_pay_at_pickup boolean not null default true,
  payment_stripe_enabled boolean not null default false,
  announcement_text text,
  announcement_href text default '/find-us',
  seo_title text,
  seo_description text,
  -- Design tokens editable without touching code (CSS variable overrides)
  brand_colors jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Editable page content blocks (hero, story, FAQ, policies, ...)
create table public.content_blocks (
  key text primary key,        -- 'hero', 'story', 'faq', 'policies', 'custom_orders'
  title text,
  body text,
  image_url text,
  extra jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger trg_content_updated before update on public.content_blocks
  for each row execute function public.set_updated_at();

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text default 'site',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Order number generator: RK-YYMMDD-XXXX
-- ------------------------------------------------------------
create or replace function public.generate_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'RK-' || to_char(now(), 'YYMMDD') || '-' ||
      upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
  end if;
  return new;
end $$;
create trigger trg_orders_number before insert on public.orders
  for each row execute function public.generate_order_number();

-- ============================================================
-- Row Level Security
-- Public (anon) can only READ published storefront data.
-- All writes go through the server (service role) or admin users.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.locations enable row level security;
alter table public.market_schedules enable row level security;
alter table public.market_products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.discount_codes enable row level security;
alter table public.site_settings enable row level security;
alter table public.content_blocks enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- profiles: users can read their own profile; admins read all
create policy "profiles_own_read" on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_write" on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- public storefront reads
create policy "categories_public_read" on public.categories for select
  using (is_visible = true or public.is_admin());
create policy "products_public_read" on public.products for select
  using (is_active = true or public.is_admin());
create policy "product_images_public_read" on public.product_images for select using (true);
create policy "product_variants_public_read" on public.product_variants for select using (true);
create policy "locations_public_read" on public.locations for select
  using (is_active = true or public.is_admin());
create policy "schedules_public_read" on public.market_schedules for select
  using (is_published = true or public.is_admin());
create policy "market_products_public_read" on public.market_products for select using (true);
create policy "reviews_public_read" on public.reviews for select
  using (is_approved = true or public.is_admin());
create policy "settings_public_read" on public.site_settings for select using (true);
create policy "content_public_read" on public.content_blocks for select using (true);

-- admin full write access (insert/update/delete) on catalog & ops tables
create policy "categories_admin_all" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());
create policy "products_admin_all" on public.products for all
  using (public.is_admin()) with check (public.is_admin());
create policy "product_images_admin_all" on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());
create policy "product_variants_admin_all" on public.product_variants for all
  using (public.is_admin()) with check (public.is_admin());
create policy "locations_admin_all" on public.locations for all
  using (public.is_admin()) with check (public.is_admin());
create policy "schedules_admin_all" on public.market_schedules for all
  using (public.is_admin()) with check (public.is_admin());
create policy "market_products_admin_all" on public.market_products for all
  using (public.is_admin()) with check (public.is_admin());
create policy "customers_admin_all" on public.customers for all
  using (public.is_admin()) with check (public.is_admin());
create policy "orders_admin_all" on public.orders for all
  using (public.is_admin()) with check (public.is_admin());
create policy "order_items_admin_all" on public.order_items for all
  using (public.is_admin()) with check (public.is_admin());
create policy "reviews_admin_all" on public.reviews for all
  using (public.is_admin()) with check (public.is_admin());
create policy "discounts_admin_all" on public.discount_codes for all
  using (public.is_admin()) with check (public.is_admin());
create policy "settings_admin_write" on public.site_settings for update
  using (public.is_admin()) with check (public.is_admin());
create policy "settings_admin_insert" on public.site_settings for insert
  with check (public.is_admin());
create policy "content_admin_all" on public.content_blocks for all
  using (public.is_admin()) with check (public.is_admin());
create policy "newsletter_admin_read" on public.newsletter_subscribers for select
  using (public.is_admin());

-- NOTE: order creation and newsletter signup are performed by the
-- server (service role key) inside server actions with Zod validation.
-- The anon key has NO write access anywhere.

-- ============================================================
-- Storage buckets (public read, admin-only write)
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('category-images', 'category-images', true),
  ('location-images', 'location-images', true),
  ('brand', 'brand', true)
on conflict (id) do nothing;

create policy "storage_public_read" on storage.objects for select
  using (bucket_id in ('product-images', 'category-images', 'location-images', 'brand'));
create policy "storage_admin_insert" on storage.objects for insert
  with check (public.is_admin() and bucket_id in ('product-images', 'category-images', 'location-images', 'brand'));
create policy "storage_admin_update" on storage.objects for update
  using (public.is_admin());
create policy "storage_admin_delete" on storage.objects for delete
  using (public.is_admin());
