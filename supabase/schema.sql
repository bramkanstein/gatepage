-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE (extends auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  billing_status text default 'free', -- 'free' or 'pro'
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Users
alter table public.users enable row level security;
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- CAMPAIGNS TABLE
create table public.campaigns (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text,
  slug text unique not null,
  header_image text,
  logo text,
  destination_url text,
  file_path text, -- Path in Supabase Storage
  delivery_method text check (delivery_method in ('reveal', 'email', 'both')) default 'reveal',
  status text check (status in ('draft', 'active', 'ended')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Campaigns
alter table public.campaigns enable row level security;
create policy "Creators can CRUD their own campaigns" on public.campaigns
  for all using (auth.uid() = creator_id);
create policy "Public can view active campaigns" on public.campaigns
  for select using (status = 'active');

-- TASKS TABLE
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  type text check (type in ('email', 'x_follow', 'x_repost', 'x_like', 'linkedin_share', 'yt_subscribe')) not null,
  config jsonb not null default '{}'::jsonb, -- e.g. { "target_username": "bram" }
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Tasks
alter table public.tasks enable row level security;
create policy "Creators can CRUD tasks for their campaigns" on public.tasks
  for all using (
    exists (
      select 1 from public.campaigns
      where id = public.tasks.campaign_id and creator_id = auth.uid()
    )
  );
create policy "Public can view tasks for active campaigns" on public.tasks
  for select using (
    exists (
      select 1 from public.campaigns
      where id = public.tasks.campaign_id and status = 'active'
    )
  );

-- LEADS TABLE
create table public.leads (
  id uuid default uuid_generate_v4() primary key,
  campaign_id uuid references public.campaigns(id) on delete cascade not null,
  email text, -- Can be null if we only track social actions (unlikely but possible)
  status text check (status in ('pending', 'completed')) default 'pending',
  task_progress jsonb default '{}'::jsonb, -- e.g. { "task_id_1": "completed" }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Leads
alter table public.leads enable row level security;
create policy "Creators can view leads for their campaigns" on public.leads
  for select using (
    exists (
      select 1 from public.campaigns
      where id = public.leads.campaign_id and creator_id = auth.uid()
    )
  );
-- Guests (leads) need to insert/update their own record. 
-- Since we use Guest Mode (local storage), we might need a secured API or anon access with strict checks.
-- For MVP, allow anon insert, but restrict update/select to the creator or the session (if we had one).
create policy "Anyone can insert leads" on public.leads
  for insert with check (true);

-- STORAGE POLICIES (For 'campaign_files' bucket)
-- Note: You must create the 'campaign_files' bucket in the Supabase Dashboard first!
-- Policy: Anyone can read (public), Authenticated users can upload
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'campaign_files' );

create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'campaign_files' and auth.role() = 'authenticated' );

-- Trigger to create public.users on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- MIGRATION: User Settings (Run this if you already have the table)
alter table public.users add column if not exists default_x_handle text;
alter table public.users add column if not exists default_yt_channel_id text;
