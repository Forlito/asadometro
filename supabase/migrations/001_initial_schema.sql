-- Asadometro Database Schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Helper function to generate short invite codes
create or replace function generate_invite_code() returns text as $$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuario'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

---------------------------------------------------
-- STEP 1: Create all tables first
---------------------------------------------------

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  invite_code text unique not null default generate_invite_code(),
  created_by uuid references profiles(id) not null,
  created_at timestamptz default now()
);

create table group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

create table events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade not null,
  title text not null default 'Asado',
  description text,
  photo_url text,
  event_date date not null,
  secret_word text not null,
  created_by uuid references profiles(id) not null,
  created_at timestamptz default now()
);

create table attendance (
  event_id uuid references events(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  checked_in_at timestamptz default now(),
  method text check (method in ('qr', 'secret_word', 'manual')),
  primary key (event_id, user_id)
);

---------------------------------------------------
-- STEP 2: Create trigger
---------------------------------------------------

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

---------------------------------------------------
-- STEP 3: Enable RLS and create policies
---------------------------------------------------

-- Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Groups
alter table groups enable row level security;
create policy "Anyone can view group by invite code" on groups for select using (true);
create policy "Authenticated users can create groups" on groups for insert
  with check (auth.uid() = created_by);
create policy "Admins can update groups" on groups for update
  using (id in (select group_id from group_members where user_id = auth.uid() and role = 'admin'));

-- Group members
alter table group_members enable row level security;
create policy "Members can see other members" on group_members for select
  using (group_id in (select group_id from group_members where user_id = auth.uid()));
create policy "Users can join groups" on group_members for insert
  with check (auth.uid() = user_id);
create policy "Admins can manage members" on group_members for delete
  using (group_id in (select group_id from group_members where user_id = auth.uid() and role = 'admin'));

-- Events
alter table events enable row level security;
create policy "Anyone can view event for checkin" on events for select using (true);
create policy "Members can create events" on events for insert
  with check (
    group_id in (select group_id from group_members where user_id = auth.uid())
    and auth.uid() = created_by
  );
create policy "Creator can update events" on events for update
  using (auth.uid() = created_by);
create policy "Creator can delete events" on events for delete
  using (auth.uid() = created_by);

-- Attendance
alter table attendance enable row level security;
create policy "Members can view attendance" on attendance for select
  using (event_id in (
    select e.id from events e
    join group_members gm on gm.group_id = e.group_id
    where gm.user_id = auth.uid()
  ));
create policy "Users can mark own attendance" on attendance for insert
  with check (auth.uid() = user_id);
create policy "Event creator can manage attendance" on attendance for insert
  with check (event_id in (select id from events where created_by = auth.uid()));
create policy "Event creator can delete attendance" on attendance for delete
  using (event_id in (select id from events where created_by = auth.uid()));
