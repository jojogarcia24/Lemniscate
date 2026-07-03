# Lemniscate backend (Supabase)

Project: **Lemniscate** · ref `tdivoeaffojenockwxbp` · region us-east-2
- API URL: `https://tdivoeaffojenockwxbp.supabase.co`
- Publishable (anon) key is embedded in `assets/lm.js` and `admin.html` — safe for the
  browser; all access is enforced by Row-Level Security.

## What's live (Phase 1)
- **Auth** — magic-link email sign-in. On signup a `profiles` row is created; emails in
  `admin_emails` (jojo@elitelivingrealty.com, hello@lemniscatemarketingsystems.com) become
  `admin`. Others are `consumer`.
- **Leads** — public forms (Book-a-Call + pre-market) insert into `public.leads`
  (`assets/lm.js` → `LM.insertLead`). Anon can INSERT only; staff read/edit; admin delete.
- **Page tracking** — `assets/lm.js` sends `enter/heartbeat/leave` rows to `public.page_events`
  (session id in localStorage, dwell seconds). Feeds the admin heat view + future hot-lead alerts.
- **Blog** — `public.blog_posts`; public can read `published`, staff manage. (Blog page still
  reads the static list for now; wiring it to this table is Phase 4.)
- **Admin** — `/admin.html`: magic-link login (staff only), Leads CRUD + rating, Activity/heat
  view, Blog CRUD.
- Also: `push_subscriptions`, `dwell_alerts`, `notifications` tables ready for Phase 2.

## One-time setup you must do (magic-link redirect)
In Supabase → **Authentication → URL Configuration**:
- **Site URL**: your production domain (e.g. `https://lemniscatemarketingsystems.com`)
- **Redirect URLs** — add:
  - `https://lemniscatemarketingsystems.com/admin.html`
  - `https://<your-netlify-site>.netlify.app/admin.html`
  - `https://deploy-preview-*--<site>.netlify.app/admin.html` (for PR previews)
Without these, the magic link will refuse to sign in on the live domain.

## Next phases
2. Dwell → hot-lead **alerts** (Edge Function on a schedule: scan `page_events`, insert
   `dwell_alerts`, send **email + web push** to the assigned agent/admin). Needs an email
   sender (Resend/SendGrid) API key + VAPID keys for push.
3. Login-gated **likes/favorites** once property listings exist.
4. **Weekly auto-blog** — scheduled Edge Function calls Claude, inserts a post; blog page
   reads from `blog_posts`. Needs an Anthropic API key stored as a project secret.
