-- ------------------------------------------------------------------
-- 0003: Align database column names with the application code.
--
-- Run this ONLY if you already created your database with the
-- previous version of 0001_schema.sql (before this fix).
-- Fresh installs using the UPDATED 0001_schema.sql do NOT need
-- this file — the updated schema already uses these names.
-- ------------------------------------------------------------------

-- Products: "published" is the name the app uses everywhere.
alter table public.products rename column is_active to is_published;
alter index if exists idx_products_active rename to idx_products_published;

-- Locations: market hours text shown on the Find Us page and admin.
alter table public.locations rename column hours_note to hours_text;

-- Site settings: richer names + columns the Settings page manages.
alter table public.site_settings rename column tax_rate to tax_rate_percent;
alter table public.site_settings
  alter column tax_rate_percent type numeric(6,3);
alter table public.site_settings
  rename column payment_pay_at_pickup to payment_pay_at_pickup_enabled;
alter table public.site_settings
  add column if not exists payment_methods_text text;
alter table public.site_settings
  add column if not exists pickup_policy text;
alter table public.site_settings
  add column if not exists discounts_enabled boolean not null default false;
