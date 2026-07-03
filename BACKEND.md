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
- **Blog** — `public.blog_posts`; public can read `published`, staff manage. `blog.html`
  renders the featured post + grid from this table; `post.html?slug=…` shows the full article.
- **Admin** — `/admin.html`: magic-link login (staff only), Leads CRUD + rating, Activity/heat
  view, Blog CRUD, **Enable alerts** (web-push subscribe) button.

## What's live (Phase 4 — auto-blog) ✅
- Edge Function **`generate-blog`** (`verify_jwt:false`, guarded by an `x-cron-secret` header)
  calls Claude (`claude-sonnet-5`, thinking disabled) and inserts a `published` post.
- **pg_cron** job `weekly-auto-blog` runs it every Monday 14:00 UTC.
- 10 curated launch posts seeded; the writer adds one automatically each week.
- Requires project secret **`ANTHROPIC_API_KEY`** (already set).

## What's live (Phase 2 — hot-lead alerts) ✅ email · ⚙️ push needs secrets
- SQL function **`hot_lead_candidates()`** returns registered leads (a captured `lead_id`) who
  dwelled ≥25s on a page in the last 15 min and haven't been alerted in the last 6 h.
- Edge Function **`notify-hot-leads`** (guarded by `x-cron-secret`) emails the admin(s) +
  assigned agent via **Resend**, sends **web push** to subscribed staff, and writes a
  `notifications` ledger row (the 6 h de-dupe).
- **pg_cron** job `hot-lead-alerts` runs it every 2 minutes.
- **Email works now** (needs secret `RESEND_API_KEY`, already set).
  - By default the "from" address is `onboarding@resend.dev`, which Resend only delivers to
    your own Resend account email. To also email assigned agents, verify a domain in Resend and
    set secret **`ALERT_FROM`** (e.g. `Lemniscate Alerts <alerts@lemniscatemarketingsystems.com>`).
  - Recipients default to `jojo@elitelivingrealty.com`; override with secret **`ALERT_EMAIL`**
    (comma-separated). Optional **`SITE_URL`** sets the "Open dashboard" link.
- **Web push — to turn on**, add these three project secrets (Supabase → Project Settings →
  Edge Functions → Secrets), then click **Enable alerts** in `/admin.html` on each device:
  - `VAPID_PUBLIC_KEY` = `BEuY81t580IVSs_fXHckU-OZLSh_9y9hWf5DdyAEHXqFTjy_gqSXgaXhbEx5aEHcYmvazNGBkz46hqBE0PRnPHE`
  - `VAPID_PRIVATE_KEY` = `M4ZG0Q-kxQhfxyXkJtqVeK242d8XTTZC2xA-362Geq0`
  - `VAPID_SUBJECT` = `mailto:hello@lemniscatemarketingsystems.com`
  (The public key is also embedded in `admin.html`; keep the two in sync if you rotate them.)

## One-time setup you must do (magic-link redirect)
In Supabase → **Authentication → URL Configuration**:
- **Site URL**: your production domain (e.g. `https://lemniscatemarketingsystems.com`)
- **Redirect URLs** — add:
  - `https://lemniscatemarketingsystems.com/admin.html`
  - `https://<your-netlify-site>.netlify.app/admin.html`
  - `https://deploy-preview-*--<site>.netlify.app/admin.html` (for PR previews)
Without these, the magic link will refuse to sign in on the live domain.

## Remaining / future
- Login-gated **likes/favorites** once property listings exist.
- Voice-live **avatar** (HeyGen streaming) — pending a HeyGen API key.
