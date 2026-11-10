-- Execute this script in the Supabase SQL Editor for the project.
-- The first authenticated account is a helper by default. Promote the professional
-- to owner using the instructions at the end of this file.

create table if not exists public.staff_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'helper' check (role in ('owner', 'helper')),
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  base_price numeric(10, 2) not null default 0 check (base_price >= 0),
  helper_amount numeric(10, 2) not null default 0 check (helper_amount >= 0),
  helper_id uuid references public.staff_profiles (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services (id) on delete set null,
  service_name text not null,
  fiber_color text not null default '',
  requested_for date not null,
  requested_time text not null,
  client_name text not null,
  social_name text not null default '',
  client_phone text not null,
  gender text not null default '',
  had_recent_chemical boolean not null default false,
  last_chemical text not null default '',
  braided_before boolean not null default false,
  hair_type text not null default '',
  payment_method text not null default '',
  inspiration_photo_names text[] not null default '{}',
  personal_photo_name text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.booking_access_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('form_visit', 'submission')),
  created_at timestamptz not null default now()
);

create table if not exists public.service_finances (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  helper_id uuid references public.staff_profiles (id) on delete set null,
  service_name text not null,
  service_amount numeric(10, 2) not null check (service_amount >= 0),
  helper_amount numeric(10, 2) not null default 0 check (helper_amount >= 0),
  payment_method text not null default '',
  paid boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists bookings_requested_for_idx on public.bookings (requested_for);
create index if not exists bookings_client_phone_idx on public.bookings (client_phone);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists booking_access_events_created_at_idx
  on public.booking_access_events (created_at desc);
create index if not exists service_finances_created_at_idx
  on public.service_finances (created_at desc);
create index if not exists service_finances_helper_id_idx
  on public.service_finances (helper_id);

create or replace function public.record_booking_access(p_event_type text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_event_type not in ('form_visit', 'submission') then
    raise exception 'Invalid booking access event';
  end if;
  insert into public.booking_access_events (event_type) values (p_event_type);
end;
$$;

create or replace function public.create_booking_request(
  p_service_name text,
  p_fiber_color text,
  p_requested_for date,
  p_requested_time text,
  p_client_name text,
  p_social_name text,
  p_client_phone text,
  p_gender text,
  p_had_recent_chemical boolean,
  p_last_chemical text,
  p_braided_before boolean,
  p_hair_type text,
  p_payment_method text,
  p_inspiration_photo_names text[],
  p_personal_photo_name text,
  p_consent boolean
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  booking_id uuid;
  matched_service_id uuid;
begin
  if not p_consent then
    raise exception 'Consent is required to save the booking request';
  end if;
  if length(trim(p_client_name)) not between 1 and 160
     or length(trim(p_client_phone)) not between 8 and 40
     or length(trim(p_service_name)) not between 1 and 120 then
    raise exception 'Invalid booking request details';
  end if;
  if cardinality(coalesce(p_inspiration_photo_names, '{}')) > 10 then
    raise exception 'Too many inspiration photos';
  end if;
  select id
  into matched_service_id
  from public.services
  where name = trim(p_service_name) and active
  limit 1;

  insert into public.bookings (
    service_id, service_name, fiber_color, requested_for, requested_time,
    client_name, social_name, client_phone, gender, had_recent_chemical,
    last_chemical, braided_before, hair_type, payment_method,
    inspiration_photo_names, personal_photo_name
  )
  values (
    matched_service_id, trim(p_service_name), left(p_fiber_color, 200), p_requested_for,
    left(p_requested_time, 20), trim(p_client_name), left(p_social_name, 160),
    trim(p_client_phone), left(p_gender, 80), p_had_recent_chemical,
    left(p_last_chemical, 80), p_braided_before, left(p_hair_type, 80),
    left(p_payment_method, 80), coalesce(p_inspiration_photo_names, '{}'),
    left(p_personal_photo_name, 255)
  )
  returning id into booking_id;

  return booking_id;
end;
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.staff_profiles
    where id = (select auth.uid()) and role = 'owner'
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.staff_profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

insert into public.services (name)
values
  ('Knotles'),
  ('Entrelace'),
  ('Nagô'),
  ('Nagô desenhada'),
  ('Nagô topo'),
  ('Fulani com orgânico'),
  ('Bon Braids')
on conflict (name) do nothing;

alter table public.staff_profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_access_events enable row level security;
alter table public.service_finances enable row level security;

drop policy if exists "staff_profiles_read_self_or_owner" on public.staff_profiles;
create policy "staff_profiles_read_self_or_owner"
  on public.staff_profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_owner()));

drop policy if exists "staff_profiles_owner_update" on public.staff_profiles;
create policy "staff_profiles_owner_update"
  on public.staff_profiles for update to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

drop policy if exists "services_read_owner_or_assigned_helper" on public.services;
create policy "services_read_owner_or_assigned_helper"
  on public.services for select to authenticated
  using ((select public.is_owner()) or helper_id = (select auth.uid()));

drop policy if exists "services_owner_insert" on public.services;
create policy "services_owner_insert"
  on public.services for insert to authenticated
  with check ((select public.is_owner()));

drop policy if exists "services_owner_update" on public.services;
create policy "services_owner_update"
  on public.services for update to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

drop policy if exists "services_owner_delete" on public.services;
create policy "services_owner_delete"
  on public.services for delete to authenticated
  using ((select public.is_owner()));

drop policy if exists "bookings_public_insert" on public.bookings;
create policy "bookings_public_insert"
  on public.bookings for insert to anon, authenticated
  with check (true);

drop policy if exists "bookings_owner_read" on public.bookings;
create policy "bookings_owner_read"
  on public.bookings for select to authenticated
  using ((select public.is_owner()));

drop policy if exists "bookings_owner_update" on public.bookings;
create policy "bookings_owner_update"
  on public.bookings for update to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

drop policy if exists "bookings_owner_delete" on public.bookings;
create policy "bookings_owner_delete"
  on public.bookings for delete to authenticated
  using ((select public.is_owner()));

drop policy if exists "booking_events_public_insert" on public.booking_access_events;
create policy "booking_events_public_insert"
  on public.booking_access_events for insert to anon, authenticated
  with check (event_type in ('form_visit', 'submission'));

drop policy if exists "booking_events_owner_read" on public.booking_access_events;
create policy "booking_events_owner_read"
  on public.booking_access_events for select to authenticated
  using ((select public.is_owner()));

drop policy if exists "service_finances_owner_all" on public.service_finances;
create policy "service_finances_owner_all"
  on public.service_finances for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

drop policy if exists "service_finances_helper_read_own" on public.service_finances;
create policy "service_finances_helper_read_own"
  on public.service_finances for select to authenticated
  using (helper_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.staff_profiles to authenticated;
grant select, insert, update, delete on public.services to authenticated;
grant select, update, delete on public.bookings to authenticated;
grant select on public.booking_access_events to authenticated;
grant select, insert, update, delete on public.service_finances to authenticated;
revoke insert on public.bookings from anon, authenticated;
revoke insert on public.booking_access_events from anon, authenticated;
grant execute on function public.is_owner() to authenticated;
revoke all on function public.record_booking_access(text) from public;
grant execute on function public.record_booking_access(text) to anon, authenticated;
revoke all on function public.create_booking_request(
  text, text, date, text, text, text, text, text, boolean, text,
  boolean, text, text, text[], text, boolean
) from public;
grant execute on function public.create_booking_request(
  text, text, date, text, text, text, text, text, boolean, text,
  boolean, text, text, text[], text, boolean
) to anon, authenticated;

-- 1. Create the professional's account in Supabase Dashboard > Authentication > Users.
-- 2. Copy that user's UUID and run this query in the SQL Editor:
--    update public.staff_profiles set role = 'owner', full_name = 'Nome profissional'
--    where id = 'UUID-DO-USUARIO';
-- 3. Invite helper accounts from Authentication > Users. They are helpers by default.
