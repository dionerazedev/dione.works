create extension if not exists pgcrypto;

create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null check (char_length(visitor_id) between 16 and 80),
  nickname text not null check (char_length(btrim(nickname)) between 2 and 32),
  location text check (location is null or char_length(btrim(location)) between 2 and 80),
  device_category text not null default 'unknown' check (device_category in ('desktop', 'mobile', 'tablet', 'unknown')),
  body text not null check (char_length(btrim(body)) between 1 and 500),
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

create index if not exists community_messages_created_at_idx on public.community_messages (created_at desc);
create index if not exists community_messages_visitor_id_idx on public.community_messages (visitor_id, created_at desc);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.community_messages(id) on delete cascade,
  reporter_visitor_id text not null check (char_length(reporter_visitor_id) between 16 and 80),
  reason text not null default 'user_report' check (char_length(btrim(reason)) between 3 and 160),
  created_at timestamptz not null default now(),
  unique (message_id, reporter_visitor_id)
);

create or replace function public.community_guard_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.nickname := btrim(regexp_replace(new.nickname, '\s+', ' ', 'g'));
  new.body := btrim(regexp_replace(new.body, '\s+', ' ', 'g'));
  new.location := nullif(btrim(regexp_replace(coalesce(new.location, ''), '\s+', ' ', 'g')), '');

  if exists (
    select 1 from public.community_messages
    where visitor_id = new.visitor_id and created_at > now() - interval '5 seconds'
  ) then
    raise exception 'rate limit: wait before sending another message';
  end if;

  if exists (
    select 1 from public.community_messages
    where visitor_id = new.visitor_id
      and lower(body) = lower(new.body)
      and created_at > now() - interval '60 seconds'
  ) then
    raise exception 'duplicate message';
  end if;

  return new;
end;
$$;

drop trigger if exists community_guard_message_trigger on public.community_messages;
create trigger community_guard_message_trigger
before insert on public.community_messages
for each row execute function public.community_guard_message();

alter table public.community_messages enable row level security;
alter table public.community_reports enable row level security;

drop policy if exists "Public can read published community messages" on public.community_messages;
create policy "Public can read published community messages"
on public.community_messages for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public can submit constrained community messages" on public.community_messages;
create policy "Public can submit constrained community messages"
on public.community_messages for insert
to anon, authenticated
with check (
  status = 'published'
  and char_length(btrim(body)) between 1 and 500
  and char_length(btrim(nickname)) between 2 and 32
);

drop policy if exists "Public can report community messages" on public.community_reports;
create policy "Public can report community messages"
on public.community_reports for insert
to anon, authenticated
with check (char_length(btrim(reason)) between 3 and 160);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_messages'
  ) then
    alter publication supabase_realtime add table public.community_messages;
  end if;
end;
$$;

comment on table public.community_messages is 'Anonymous, nickname-based portfolio community messages. Moderators hide a message by setting status to hidden with the service role or Supabase dashboard.';
comment on table public.community_reports is 'Private moderation queue. Never expose this table to the anon role.';
