create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text,
  last_name text,
  photo_url text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  exercise_name text not null,
  reps integer not null,
  sets integer not null,
  weight_kg numeric(10, 2) not null,
  notes text,
  workout_date timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now()
);

create index if not exists workouts_user_id_idx on public.workouts (user_id);
create index if not exists workouts_workout_date_idx on public.workouts (workout_date desc);
create index if not exists workouts_exercise_name_idx on public.workouts (exercise_name);

alter table public.users enable row level security;
alter table public.workouts enable row level security;

create policy "Users can view own profile"
on public.users for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.users for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can view own workouts"
on public.workouts for select
using (auth.uid() = user_id);

create policy "Users can insert own workouts"
on public.workouts for insert
with check (auth.uid() = user_id);

create policy "Users can update own workouts"
on public.workouts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own workouts"
on public.workouts for delete
using (auth.uid() = user_id);
