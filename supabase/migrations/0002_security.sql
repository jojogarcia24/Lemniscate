-- Security hardening (from Supabase advisor)
alter table public.admin_emails enable row level security;   -- lock allowlist (definer trigger still reads it)

create or replace function public.touch_updated_at() returns trigger
  language plpgsql set search_path=public as $$begin new.updated_at=now(); return new; end;$$;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
-- is_admin()/is_staff() must stay executable by anon+authenticated: they are referenced
-- inside RLS policies (incl. public blog reads) and safely return false for non-staff.
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_staff() to anon, authenticated;
