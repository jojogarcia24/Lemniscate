# Lemniscate — marketing site

The Lemniscate landing page, modeled on the Marketingverse home-page layout
(`home.the-marketingverse.com`) but rebuilt with Lemniscate's own branding,
copy, sub-brands, and contact info. Self-contained static site (all CSS/JS
inline) so it can live on its own domain, e.g. **lemniscatemarketingsystems.com**.

## What's in here
- `index.html` — the full single-page site (dark-on-white, mobile-first).
- `netlify.toml` — minimal static-site config.

## Page structure (mirrors the Marketingverse home)
1. **Nav** — Home · Social · Broker CRM · AI Integrations · Blog · Results · Contact + Book a Call
2. **Hero** — big `Lemniscate` wordmark, "Scaling real estate teams with *AI storytelling*…", three pill CTAs (Social Media / Broker CRM / AI Systems), Book-a-Strategy-Call link
3. **Service cards** — Social Media · Content Marketing · AI Automations · Broker CRM
4. **The Modern Business Engine** — "Social Media is *A Must*" + four points, with a dark `90% Consumer Choice` stat card and Content Engine preview
5. **Next-Gen Consulting** — "Identify Your Strategy. *Instant & Live*" + the live **Nova** AI concierge (LiveAvatar embed)
6. **Proven Performance** — "Trusted by *Industry Leaders*" logo grid
7. **Final CTA / Contact** — "Ready to take it up a notch?" with the wired Book-a-Call form
8. **Footer** + floating back-to-top / chat buttons

## Deploy it (≈10 minutes)
1. Push this repo, then in Netlify → "Add new site → Import an existing project", pick the repo. Publish directory: `.` (root). Deploy.
2. **Custom domain** — add `lemniscatemarketingsystems.com` (and `www`) in Netlify → Domain settings and point DNS at Netlify. SSL is automatic.

## The Book-a-Call form (already wired)
The form posts **cross-origin** to Elite Living's existing function:

    https://www.elitelivingrealty.com/.netlify/functions/marketing-inquire

CORS is open there (`Access-Control-Allow-Origin: *`), so submissions land in the
shared marketing-leads dashboard + GHL. To route into a separate Lemniscate GHL,
edit the `ENDPOINT` variable in the form script near the bottom of `index.html`.

## Placeholders to fill in
- **"Trusted by Industry Leaders" logos** — only Elite Living Realty and Avanti Way
  are shown as real relationships; the rest are `Your Brand` placeholder tiles.
  Swap in real client logos/names as they come online. **Do not** add brands
  Lemniscate hasn't actually worked with.
- **Content Engine preview** — three gradient video thumbnails are placeholders;
  drop in real clips/thumbnails.
- **Social links** — footer Instagram/LinkedIn/YouTube are `#` placeholders.
- **Legal** — footer Privacy/Terms link to `/privacy-policy.html` and
  `/terms-of-use.html`; add those pages or repoint the links.

## The Nova live demo
The AI concierge card embeds the working LiveAvatar embed (vertical on phones,
horizontal on desktop). It runs as-is on HTTPS. The free embed keeps the HeyGen
watermark — a paid LiveAvatar plan removes it.
