-- =====================================================================
--  NUMEROLOGY – Bootstrap completo para Supabase
--  Pega este archivo entero en:  Supabase → SQL Editor → New query → Run
--  Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- =====================================================================

-- ------------------------------------------------------------------
-- 1. Roles de administrador  (necesario para el panel /admin)
-- ------------------------------------------------------------------
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'user');
  end if;
end $$;

create table if not exists public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

alter table public.user_roles enable row level security;

drop policy if exists "Users can read own roles" on public.user_roles;
create policy "Users can read own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $f$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$f$;

-- ------------------------------------------------------------------
-- 2. Órdenes (compras únicas)
-- ------------------------------------------------------------------
create table if not exists public.orders (
  id                    uuid primary key default gen_random_uuid(),
  stripe_session_id     text unique not null,
  stripe_payment_intent text,
  product_key           text not null,
  amount_cents          integer not null,
  currency              text not null,
  customer_email        text not null,
  customer_name         text,
  birth_date            date,
  language              text default 'en',
  numerology_data       jsonb,
  status                text not null default 'pending',
  report_text           text,
  report_pdf_url        text,
  email_message_id      text,
  error_message         text,
  metadata              jsonb default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  completed_at          timestamptz,
  sent_at               timestamptz
);

create index if not exists orders_email_idx       on public.orders(customer_email);
create index if not exists orders_status_idx      on public.orders(status);
create index if not exists orders_created_at_idx  on public.orders(created_at desc);
create index if not exists orders_product_key_idx on public.orders(product_key);

-- ------------------------------------------------------------------
-- 3. Suscripciones (4 tiers)
-- ------------------------------------------------------------------
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  stripe_subscription_id   text unique not null,
  stripe_customer_id       text not null,
  customer_email           text not null,
  customer_name            text,
  tier_id                  text not null,
  status                   text not null,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean default false,
  metadata                 jsonb default '{}'::jsonb,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index if not exists subs_email_idx  on public.subscriptions(customer_email);
create index if not exists subs_status_idx on public.subscriptions(status);
create index if not exists subs_tier_idx   on public.subscriptions(tier_id);

-- ------------------------------------------------------------------
-- 4. Prompts editables desde el panel admin
-- ------------------------------------------------------------------
create table if not exists public.report_prompts (
  id                    uuid primary key default gen_random_uuid(),
  product_key           text unique not null,
  language              text not null default 'es',
  system_prompt         text not null,
  user_prompt_template  text not null,
  model                 text not null default 'gpt-4o',
  temperature           numeric default 0.85,
  max_tokens            integer default 6000,
  word_count_min        integer default 1200,
  word_count_max        integer default 1800,
  is_active             boolean default true,
  updated_at            timestamptz not null default now()
);

create index if not exists prompts_product_idx on public.report_prompts(product_key, language);

-- ------------------------------------------------------------------
-- 5. Eventos Stripe (idempotencia)
-- ------------------------------------------------------------------
create table if not exists public.stripe_webhook_events (
  id            text primary key,
  type          text not null,
  payload       jsonb not null,
  processed_at  timestamptz not null default now(),
  status        text not null default 'received',
  error         text
);

-- ------------------------------------------------------------------
-- 6. Trigger updated_at
-- ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated   on public.orders;
create trigger trg_orders_updated   before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_subs_updated     on public.subscriptions;
create trigger trg_subs_updated     before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_prompts_updated  on public.report_prompts;
create trigger trg_prompts_updated  before update on public.report_prompts
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- 7. RLS – solo administradores leen/modifican
-- ------------------------------------------------------------------
alter table public.orders                enable row level security;
alter table public.subscriptions         enable row level security;
alter table public.report_prompts        enable row level security;
alter table public.stripe_webhook_events enable row level security;

drop policy if exists "Admins can read orders"   on public.orders;
create policy "Admins can read orders"   on public.orders   for select
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders   for update
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can read subs"     on public.subscriptions;
create policy "Admins can read subs"     on public.subscriptions for select
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can manage prompts" on public.report_prompts;
create policy "Admins can manage prompts" on public.report_prompts for all
  using (public.has_role(auth.uid(), 'admin'));

-- ------------------------------------------------------------------
-- 8. Storage bucket para los PDFs
-- ------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('reports', 'reports', true)
on conflict (id) do nothing;

drop policy if exists "Public can read reports" on storage.objects;
create policy "Public can read reports"
  on storage.objects for select
  using (bucket_id = 'reports');

-- ------------------------------------------------------------------
-- 9. Listo ✓
-- ------------------------------------------------------------------
-- DESPUÉS de ejecutar este script, ejecuta en una segunda consulta el
-- archivo MAKE_ME_ADMIN.sql para darte permisos de administrador.
