<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Waena Inn — project rules

Vacation-rental redesign for a Frontline Web Designs client — **Waena Inn**, boutique lodging
in Wailuku, Maui (~25 1BR "Maui Private Suite" units). Replaces the old JS-rendered site.

## Stack
**Next.js 16 + React 19 + Tailwind v4 + Zod 4** (App Router, TS). This is newer than your
training data — theme tokens live in `globals.css` `@theme` (NOT a `tailwind.config`), and
**dynamic route `params` are async — `await` them.** Fonts: **Sora** (display) + **Inter** (body)
via `next/font`. Content (25 real suites, real client photos ~70MB in-repo) is in
`content/site.json`.

## Deploy
- Vercel **git auto-deploy** from `github.com/tannermosher2015-debug/WaenaInn` (private, `main`).
  Push via Git Credential Manager. `gh`/`vercel` CLIs are not installed here.

## Brand (warm Maui boutique)
sand `#F6F1E9` · espresso `#2B201A` · clay `#B5683E` · palm teal `#27514A` · taupe `#D9CFC2`.
WCAG-AA throughout (dark sections ≈13.7:1).

## ⚠️ Stripe is DEFERRED by the client
Phase 1 (browse site) is complete. The BookingWidget does a **live price breakdown + an
email-based "Request to book" (prefilled mailto) — NO card payment.** The client said **"wait
for real payment"** → **do NOT build the Stripe layer (not even test mode)** until they have a
real payment account ready. When they are: `/api/checkout` (manual-capture PaymentIntent),
checkout page (Payment Element), webhook→Resend host email, confirmation page. See
`docs/superpowers/plans/2026-06-13-waena-inn-booking-payments.md`.

## Placeholders to confirm with client (flagged TODO in README/code)
Cleaning fee amount · exact tax rate (default ≈17.75% Hawaii GET/TAT) · phone/address · domain ·
live Stripe + Resend keys. Suites scraped as studios (1 bed/bath, $200/night flat) — verify.
