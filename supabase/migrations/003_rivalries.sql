create table if not exists public.rivalries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  rival_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamp with time zone not null default now(),
  accepted_at timestamp with time zone,
  unique (user_id, rival_id),
  check (user_id <> rival_id),
  check (status in ('pending', 'accepted', 'rejected'))
);

create index if not exists rivalries_user_id_idx on public.rivalries (user_id);
create index if not exists rivalries_rival_id_idx on public.rivalries (rival_id);

create table if not exists public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  code text unique not null,
  expires_at timestamp with time zone,
  used_by uuid references public.users(id),
  created_at timestamp with time zone not null default now()
);

create index if not exists invite_codes_user_id_idx on public.invite_codes (user_id);
create index if not exists invite_codes_code_idx on public.invite_codes (code);
create index if not exists invite_codes_used_by_idx on public.invite_codes (used_by);

alter table public.rivalries enable row level security;
alter table public.invite_codes enable row level security;

create policy "Users can view own rivalries"
on public.rivalries for select
using (auth.uid() = user_id or auth.uid() = rival_id);

create policy "Users can create own rivalries"
on public.rivalries for insert
with check (auth.uid() = user_id);

create policy "Users can update own rivalries"
on public.rivalries for update
using (auth.uid() = user_id or auth.uid() = rival_id)
with check (auth.uid() = user_id or auth.uid() = rival_id);

create policy "Users can view own invite codes"
on public.invite_codes for select
using (auth.uid() = user_id or auth.uid() = used_by);

create policy "Users can create own invite codes"
on public.invite_codes for insert
with check (auth.uid() = user_id);

create policy "Users can update own invite codes"
on public.invite_codes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
