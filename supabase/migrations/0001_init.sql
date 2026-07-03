-- Lemniscate backend — Phase 1 schema
-- Auth (magic link), leads, page dwell tracking, ratings, blog posts, push, notifications.

-- ===== enums =====
create type user_role   as enum ('consumer','agent','admin');
create type lead_status as enum ('new','contacted','qualified','nurturing','won','lost');
create type post_status as enum ('draft','published');

-- ===== profiles (mirror of auth.users) =====
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role user_role not null default 'consumer',
  assigned_agent_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- admin allowlist (emails that become admins on signup)
create table public.admin_emails (email text primary key);
insert into public.admin_emails(email) values
  ('jojo@elitelivingrealty.com'),
  ('hello@lemniscatemarketingsystems.com');

-- helpers
create or replace function public.is_staff() returns boolean
  language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','agent'));
$$;
create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- auto-create profile on signup; admin role if email is allowlisted
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, email, full_name, phone, role)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'phone',
    case when exists(select 1 from public.admin_emails a where a.email = new.email)
         then 'admin'::user_role else 'consumer'::user_role end
  );
  return new;
end;$$;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

create policy "profiles self or staff read"  on public.profiles for select using (auth.uid() = id or public.is_staff());
create policy "profiles self or staff update" on public.profiles for update using (auth.uid() = id or public.is_staff());
create policy "profiles admin manage"         on public.profiles for all    using (public.is_admin()) with check (public.is_admin());

-- ===== leads =====
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text, last_name text, email text, phone text,
  company text, role_text text, intent text, message text, source_page text,
  status lead_status not null default 'new',
  rating int not null default 0 check (rating between 0 and 100),   -- likely-to-purchase
  interest_score int not null default 0,                            -- rolling dwell score
  assigned_agent_id uuid references public.profiles(id),
  user_id uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leads enable row level security;
create policy "leads public insert" on public.leads for insert to anon, authenticated with check (true);
create policy "leads staff read"    on public.leads for select using (public.is_staff());
create policy "leads staff update"  on public.leads for update using (public.is_staff()) with check (public.is_staff());
create policy "leads admin delete"  on public.leads for delete using (public.is_admin());

create or replace function public.touch_updated_at() returns trigger
  language plpgsql as $$begin new.updated_at=now(); return new; end;$$;
create trigger leads_touch before update on public.leads
  for each row execute function public.touch_updated_at();

-- ===== page_events (dwell / heat-map) =====
create table public.page_events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id),
  lead_id uuid references public.leads(id),
  session_id text,
  path text not null,
  event_type text not null default 'heartbeat',   -- enter | heartbeat | leave
  dwell_seconds int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.page_events enable row level security;
create policy "events public insert" on public.page_events for insert to anon, authenticated with check (true);
create policy "events staff read"    on public.page_events for select using (public.is_staff());
create index page_events_user_path_idx on public.page_events(user_id, path, created_at desc);

-- ===== dwell alerts (dedupe notifications) =====
create table public.dwell_alerts (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id),
  lead_id uuid references public.leads(id),
  path text, dwell_seconds int,
  created_at timestamptz not null default now()
);
alter table public.dwell_alerts enable row level security;
create policy "alerts staff read" on public.dwell_alerts for select using (public.is_staff());

-- ===== push subscriptions (admin/agent devices) =====
create table public.push_subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "push own manage" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== blog posts =====
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default 'AI Systems',
  excerpt text,
  body text,
  cover_gradient text default 'linear-gradient(150deg,#a9c7ff,#e3c8ff)',
  read_minutes int default 5,
  status post_status not null default 'draft',
  author text default 'Lemniscate',
  published_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;
create policy "posts public read published" on public.blog_posts for select using (status='published' or public.is_staff());
create policy "posts staff manage"          on public.blog_posts for all    using (public.is_staff()) with check (public.is_staff());

-- ===== notifications log =====
create table public.notifications (
  id bigint generated always as identity primary key,
  lead_id uuid references public.leads(id),
  user_id uuid references public.profiles(id),
  type text, channel text, title text, body text,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "notifications staff read" on public.notifications for select using (public.is_staff());
