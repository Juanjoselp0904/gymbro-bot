create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text,
  created_at timestamp with time zone not null default now()
);

create index if not exists exercises_name_idx on public.exercises (name);

insert into public.exercises (name, category) values
  ('Press banca', 'Pecho'),
  ('Press inclinado', 'Pecho'),
  ('Aperturas', 'Pecho'),
  ('Sentadilla', 'Piernas'),
  ('Peso muerto', 'Piernas'),
  ('Prensa', 'Piernas'),
  ('Curl femoral', 'Piernas'),
  ('Extensión cuádriceps', 'Piernas'),
  ('Dominadas', 'Espalda'),
  ('Remo con barra', 'Espalda'),
  ('Jalón al pecho', 'Espalda'),
  ('Press militar', 'Hombros'),
  ('Elevaciones laterales', 'Hombros'),
  ('Face pulls', 'Hombros'),
  ('Curl bíceps', 'Brazos'),
  ('Tríceps en polea', 'Brazos'),
  ('Fondos', 'Brazos')
on conflict (name) do nothing;

alter table public.workouts add column if not exists exercise_id uuid references public.exercises(id);

update public.workouts w
set exercise_id = e.id
from public.exercises e
where lower(trim(w.exercise_name)) = lower(e.name);

insert into public.exercises (name, category)
select distinct initcap(trim(exercise_name)), 'Otro'
from public.workouts
where exercise_id is null
  and trim(exercise_name) != ''
on conflict (name) do nothing;

update public.workouts w
set exercise_id = e.id
from public.exercises e
where lower(trim(w.exercise_name)) = lower(e.name)
  and w.exercise_id is null;

alter table public.workouts alter column exercise_id set not null;
alter table public.workouts alter column exercise_name drop not null;

create index if not exists workouts_exercise_id_idx on public.workouts (exercise_id);
