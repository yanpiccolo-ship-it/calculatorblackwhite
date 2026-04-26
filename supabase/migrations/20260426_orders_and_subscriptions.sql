-- =====================================================================
-- Migración: Sistema de órdenes, informes y suscripciones
-- Ejecutar en Supabase Dashboard → SQL Editor
-- =====================================================================

-- 1. Tabla de órdenes (compras únicas: Initial €9.99, Complete €29.99, Master €59.99)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  stripe_payment_intent text,
  product_key text not null,           -- 'premium_pdf' | 'complete_report' | 'master_premium'
  amount_cents integer not null,
  currency text not null,
  customer_email text not null,
  customer_name text,
  birth_date date,
  language text default 'en',
  numerology_data jsonb,               -- { lifePath, soul, personality, expression, personalYear, ... }
  status text not null default 'pending', -- pending | processing | completed | sent | error
  report_text text,                    -- texto generado por la IA
  report_pdf_url text,                 -- URL pública (Supabase Storage) del PDF
  email_message_id text,               -- ID del email enviado (Resend)
  error_message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  sent_at timestamptz
);

create index if not exists orders_email_idx on public.orders(customer_email);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_product_key_idx on public.orders(product_key);

-- 2. Tabla de suscripciones (los 4 tiers del /pricing)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  customer_email text not null,
  customer_name text,
  tier_id text not null,               -- 'solo_aura' | 'binary_essence' | 'ai_sales_master' | 'monolith_empire'
  status text not null,                -- active | trialing | past_due | canceled | incomplete
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subs_email_idx on public.subscriptions(customer_email);
create index if not exists subs_status_idx on public.subscriptions(status);
create index if not exists subs_tier_idx on public.subscriptions(tier_id);

-- 3. Tabla de prompts editables (admin puede modificar sin tocar código)
create table if not exists public.report_prompts (
  id uuid primary key default gen_random_uuid(),
  product_key text unique not null,    -- 'premium_pdf' | 'complete_report' | 'master_premium'
  language text not null default 'es',
  system_prompt text not null,
  user_prompt_template text not null,  -- usa {{name}} {{lifePath}} etc.
  model text not null default 'gpt-4o',
  temperature numeric default 0.85,
  max_tokens integer default 6000,
  word_count_min integer default 1200,
  word_count_max integer default 1800,
  is_active boolean default true,
  updated_at timestamptz not null default now()
);

create index if not exists prompts_product_idx on public.report_prompts(product_key, language);

-- 4. Eventos del webhook Stripe (idempotencia + auditoría)
create table if not exists public.stripe_webhook_events (
  id text primary key,                 -- Stripe event id (evt_...)
  type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  status text not null default 'received', -- received | processed | error
  error text
);

-- 5. Trigger para updated_at automático
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_subs_updated on public.subscriptions;
create trigger trg_subs_updated before update on public.subscriptions
  for each row execute function public.set_updated_at();

drop trigger if exists trg_prompts_updated on public.report_prompts;
create trigger trg_prompts_updated before update on public.report_prompts
  for each row execute function public.set_updated_at();

-- 6. Row Level Security: bloquear acceso público; service_role lo bypassa
alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;
alter table public.report_prompts enable row level security;
alter table public.stripe_webhook_events enable row level security;

-- Solo administradores pueden leer (vía user_roles existente)
drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders" on public.orders for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders" on public.orders for update
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

drop policy if exists "Admins can read subs" on public.subscriptions;
create policy "Admins can read subs" on public.subscriptions for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

drop policy if exists "Admins can manage prompts" on public.report_prompts;
create policy "Admins can manage prompts" on public.report_prompts for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid() and user_roles.role = 'admin'
    )
  );

-- 7. Storage bucket para los PDFs generados
insert into storage.buckets (id, name, public)
values ('reports', 'reports', true)
on conflict (id) do nothing;

-- Política: cualquiera con la URL puede leer; solo service_role escribe
drop policy if exists "Public can read reports" on storage.objects;
create policy "Public can read reports" on storage.objects for select
  using (bucket_id = 'reports');
