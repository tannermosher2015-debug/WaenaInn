# Waena Inn

Boutique vacation-lodging website for **Waena Inn** — private suites in Wailuku, Maui.
A redesign of the previous site (`uncletonyshale.holidayfuture.com`), built for Frontline Web Designs.

Design direction: warm Maui-boutique aesthetic (sand / espresso / clay / palm-teal).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (theme tokens in `src/app/globals.css` `@theme`)
- **Zod v4** for content validation
- **Vitest** for unit tests, **Playwright** for the content scrape
- Deploy target: **Vercel**

## Scripts

```bash
npm run dev      # local dev server (http://localhost:3000)
npm run build    # production build (statically generates all pages)
npm start        # serve the production build
npm test         # run unit tests (schema, parser, components, filter)
npm run scrape   # re-pull suite content + photos from the live source site
```

## Project structure

- `src/app` — routes: `/` (home), `/suites` (filterable grid), `/suites/[slug]` (detail + gallery), `/about`, `/contact`, plus `sitemap.ts` / `robots.ts`.
- `src/components` — `Nav`, `Footer`, `Button`, `SuiteCard`, `Gallery`, `RatingPill`, `AmenityList`, `Section`, `JsonLd`.
- `src/lib` — `site.ts` (brand constants), `suites.ts` + `suites.schema.ts` (typed content loader), `filterSuites.ts`, `siteContent.ts`.
- `content/suites/*.json` — 18 real suites (scraped). `content/site.json` — about copy.
- `public/suites/<slug>/*.jpg` — real suite photos (the client's own assets).
- `scripts/` — `scrape.ts` (Playwright runner) + `parseSuite.ts` (pure parser, tested).

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel (framework auto-detected as Next.js).
3. Set the production **domain** and (later) the booking env vars from `.env.example`.
4. `git push` → Vercel auto-deploys. Update `SITE.url` in `src/lib/site.ts` to the final domain (used by sitemap, metadata, and JSON-LD).

## Status

**Phase 1 — Content & browse site: complete.** All pages, real scraped content, filterable
suites, SEO (sitemap/robots/`LodgingBusiness` JSON-LD), responsive + WCAG-AA verified.

**Phase 2 — Booking & payments: planned** (`docs/superpowers/plans/2026-06-13-waena-inn-booking-payments.md`).
Stripe authorize-now / capture-on-confirm checkout, Hawaii-tax price math, host email. The suite
detail page currently shows a "Request to book" CTA pointing to `/contact` as the seam for that work.

## Outstanding items to confirm with the client

These were not available from the source site and are flagged in code as `TODO(client)`:

- **Pricing** — every suite scraped as a flat `$200/night` (the live site shows a base rate without
  date selection). Confirm real nightly rates / seasonal pricing.
- **Cleaning fee** — unknown (defaulted to `$0`/placeholder).
- **Bedrooms / bathrooms / beds** — not exposed by the source; assumed `1 / 1 / 1` (studio units).
- **Tax rate** — default Maui GET + TAT + county ≈ **17.75%**; confirm with the client's accountant.
- **Phone & street address** — not published on the source; site is email-only until provided
  (`src/lib/site.ts`).
- **About copy** — the source About page had no body text; `content/site.json` has a flagged placeholder.
- **Production domain** — set `SITE.url` once chosen.
- **Stripe + Resend accounts** — needed to go live with bookings (Phase 2).
