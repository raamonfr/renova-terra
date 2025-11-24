-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamp default now()
);

-- Create committees table
create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  neighborhood text,
  creator_id uuid not null references auth.users(id),
  created_at timestamp default now(),
  image_url text
);

-- Create committee members table
create table if not exists public.committee_members (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamp default now(),
  unique(committee_id, user_id)
);

-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  committee_id uuid not null references public.committees(id) on delete cascade,
  title text not null,
  description text,
  event_date timestamp not null,
  location text,
  created_by uuid not null references auth.users(id),
  created_at timestamp default now()
);

-- Create event attendance table
create table if not exists public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  confirmed_at timestamp default now(),
  unique(event_id, user_id)
);

-- Create rewards table
create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  points_cost integer,
  image_url text,
  created_at timestamp default now()
);

-- Create user points table
create table if not exists public.user_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer default 0,
  updated_at timestamp default now(),
  unique(user_id)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.committees enable row level security;
alter table public.committee_members enable row level security;
alter table public.events enable row level security;
alter table public.event_attendance enable row level security;
alter table public.rewards enable row level security;
alter table public.user_points enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- RLS Policies for committees (public read, but only creators can edit)
create policy "Anyone can view committees"
  on public.committees for select
  using (true);

create policy "Creators can update committees"
  on public.committees for update
  using (auth.uid() = creator_id);

create policy "Users can create committees"
  on public.committees for insert
  with check (auth.uid() = creator_id);

-- RLS Policies for committee_members
create policy "Anyone can view committee members"
  on public.committee_members for select
  using (true);

create policy "Users can join committees"
  on public.committee_members for insert
  with check (auth.uid() = user_id);

create policy "Users can leave committees"
  on public.committee_members for delete
  using (auth.uid() = user_id);

-- RLS Policies for events
create policy "Anyone can view events"
  on public.events for select
  using (true);

create policy "Committee creators can create events"
  on public.events for insert
  with check (auth.uid() = created_by);

-- RLS Policies for event_attendance
create policy "Users can view attendance"
  on public.event_attendance for select
  using (true);

create policy "Users can confirm attendance"
  on public.event_attendance for insert
  with check (auth.uid() = user_id);

create policy "Users can remove attendance"
  on public.event_attendance for delete
  using (auth.uid() = user_id);

-- RLS Policies for rewards
create policy "Anyone can view rewards"
  on public.rewards for select
  using (true);

-- RLS Policies for user_points
create policy "Users can view their points"
  on public.user_points for select
  using (auth.uid() = user_id);

-- Create trigger for auto profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  
  insert into public.user_points (user_id, points)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
