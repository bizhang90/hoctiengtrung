-- Học Tiếng Trung: Supabase chỉ lưu user + tiến độ học.
-- Nội dung bài học/video vẫn nằm ở Cloudflare R2.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  progress smallint not null default 0 check (progress between 0 and 100),
  last_tab text,
  best_quiz_score smallint check (best_quiz_score between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  percentage smallint generated always as ((score * 100 / total)::smallint) stored,
  created_at timestamptz not null default now()
);

create table if not exists public.vocabulary_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_key text not null,
  mastery smallint not null default 0 check (mastery between 0 and 100),
  correct_count integer not null default 0 check (correct_count >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, vocabulary_key)
);

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.vocabulary_progress enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "lesson_progress_select_own" on public.lesson_progress for select using (auth.uid() = user_id);
create policy "lesson_progress_insert_own" on public.lesson_progress for insert with check (auth.uid() = user_id);
create policy "lesson_progress_update_own" on public.lesson_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "quiz_attempts_select_own" on public.quiz_attempts for select using (auth.uid() = user_id);
create policy "quiz_attempts_insert_own" on public.quiz_attempts for insert with check (auth.uid() = user_id);

create policy "vocabulary_progress_select_own" on public.vocabulary_progress for select using (auth.uid() = user_id);
create policy "vocabulary_progress_insert_own" on public.vocabulary_progress for insert with check (auth.uid() = user_id);
create policy "vocabulary_progress_update_own" on public.vocabulary_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create index if not exists lesson_progress_updated_idx on public.lesson_progress(user_id, updated_at desc);
create index if not exists quiz_attempts_user_lesson_idx on public.quiz_attempts(user_id, lesson_id, created_at desc);
create index if not exists vocabulary_review_idx on public.vocabulary_progress(user_id, next_review_at);
