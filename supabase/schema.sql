create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price numeric not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'متوفر' check (status in ('متوفر', 'نفاذ', 'استلام')),
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text,
  amount numeric not null check (amount > 0),
  due_date text,
  status text not null default 'متأخر' check (status in ('تم الاستلام', 'متأخر')),
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  notifications_debts boolean not null default true,
  notifications_inventory boolean not null default true,
  unique (user_id)
);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create policy "Public product image read access"
on storage.objects for select
to public
using (bucket_id = 'product-images');

create policy "Public product image upload access"
on storage.objects for insert
to public
with check (bucket_id = 'product-images');

create policy "Public product image update access"
on storage.objects for update
to public
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');
