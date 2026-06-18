-- Tradelater.ch – Supabase / PostgreSQL Schema
-- Ausführen im Supabase SQL Editor. RLS-Policies sind als Ausgangspunkt gedacht.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Users (ergänzt auth.users; role-basiertes Marktplatz-Profil)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text default '',
  role text not null default 'buyer' check (role in ('admin','seller','buyer')),
  phone text default '',
  avatar_url text default '',
  stripe_account_id text,
  stripe_customer_id text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  seller_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text default '',
  price numeric(12,2) not null default 0,
  currency text default 'CHF',
  category text default 'general',
  images jsonb default '[]'::jsonb,
  stock integer default 1,
  status text default 'online' check (status in ('online','paused','sold','draft')),
  allow_offers boolean default true,
  delivery_options jsonb default '["pickup","shipping"]'::jsonb,
  location text default '',
  seo jsonb default '{"keywords":[],"meta_title":"","meta_description":""}'::jsonb,
  boosted_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Offers (Verhandlung)
-- ---------------------------------------------------------------------------
create table if not exists public.offers (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  buyer_id uuid references public.users(id),
  seller_id uuid references public.users(id),
  amount numeric(12,2) not null,
  currency text default 'CHF',
  status text default 'pending' check (status in ('pending','countered','accepted','rejected','expired')),
  message text default '',
  history jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id),
  buyer_id uuid references public.users(id),
  seller_id uuid references public.users(id),
  offer_id uuid references public.offers(id),
  amount numeric(12,2) not null,
  currency text default 'CHF',
  status text default 'pending_payment' check (status in
    ('pending_payment','funds_held','processing','shipped','delivered','completed','disputed','refunded','cancelled')),
  delivery_method text default 'shipping',
  shipping_address jsonb,
  transaction_id uuid,
  shipment_id uuid,
  buyer_confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Transactions (Treuhand / Escrow Buchungen)
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  buyer_id uuid references public.users(id),
  seller_id uuid references public.users(id),
  amount numeric(12,2) not null,
  platform_fee numeric(12,2) default 0,
  currency text default 'CHF',
  status text default 'authorized' check (status in ('authorized','captured','released','refunded','failed')),
  payment_intent_id text,
  transfer_id text,
  refund_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Shipments (Logistik)
-- ---------------------------------------------------------------------------
create table if not exists public.shipments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  carrier text default '',
  tracking_number text default '',
  status text default 'label_created',
  events jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Ads (Werbe-Engine)
-- ---------------------------------------------------------------------------
create table if not exists public.ads (
  id uuid primary key default uuid_generate_v4(),
  advertiser_id uuid references public.users(id),
  product_id uuid references public.products(id),
  slot text default 'home_banner',
  budget numeric(12,2) default 0,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  status text default 'pending' check (status in ('pending','active','finished','rejected')),
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Reports (System-Monitoring / Meldungen)
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  type text default 'technical' check (type in ('technical','delivery_delay','order_problem','dispute')),
  severity text default 'info' check (severity in ('info','warning','critical')),
  ref_id uuid,
  message text default '',
  resolved boolean default false,
  created_at timestamptz default now()
);

-- Indizes
create index if not exists idx_products_seller on public.products(seller_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_orders_buyer on public.orders(buyer_id);
create index if not exists idx_orders_seller on public.orders(seller_id);
create index if not exists idx_offers_product on public.offers(product_id);
create index if not exists idx_tx_order on public.transactions(order_id);

-- RLS (Beispiel-Policies – im Produktivbetrieb verfeinern)
alter table public.products enable row level security;
create policy "products_read_all" on public.products for select using (true);
create policy "products_write_owner" on public.products for all
  using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
