create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  user_name text not null,
  birth_date text not null,
  report_type text not null check (report_type in ('complete', 'master_premium')),
  stripe_session_id text,
  stripe_payment_intent text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'sent')),
  destiny_number integer,
  soul_number integer,
  personality_number integer,
  personal_year_number integer,
  expression_number integer,
  karmic_numbers text,
  generated_report text,
  amount_paid numeric(10,2),
  currency text default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Admin can manage orders" on public.orders
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Allow insert from service role" on public.orders
  for insert
  with check (true);

create or replace function public.handle_order_updated()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_order_updated
  before update on public.orders
  for each row execute procedure public.handle_order_updated();
