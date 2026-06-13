# Waena Inn — Website Redesign Design Spec (v1)

**Date:** 2026-06-13
**Client:** Waena Inn — boutique vacation lodging, Wailuku, Maui
**Source site (to replace):** https://uncletonyshale.holidayfuture.com/
**Design reference:** "homely" Accommodation Landing Page (Divi Pixel layout) — warm brown/cream boutique aesthetic
**Builder:** Frontline Web Designs

---

## 1. Goal

Rebuild Waena Inn's vacation-rental site as a modern, fast, SEO-friendly multi-page React
site with online card-payment booking. Carry over the real content (photos, prices, unit
details, story) from the existing live site. Visual language follows the "homely" reference:
warm, minimalist, boutique, big rounded headings, rounded-corner cards, generous whitespace.

## 2. Confirmed decisions

| Decision | Choice |
|---|---|
| Brand name / tagline | **Waena Inn** — "Boutique Lodging in Wailuku, Maui — Central & Comfortable" |
| Scope | Full multi-page site (Home, Suites, Suite detail, Checkout, About, Contact) |
| Content source | **Scrape the live public pages** (JS-rendered) for real photos/prices/descriptions |
| Booking depth | **Full online card payment** via Stripe |
| Capture model | **Authorize-now / capture-on-confirm** (`capture_method: manual`) |
| Availability | **No live availability v1** — host manages conflicts manually; lightweight blocked-dates file |
| Pricing math | Nightly × nights **+ cleaning fee + Hawaii GET/TAT taxes** (configurable, default ≈ 17.75%) |
| Stripe | **Test mode** now; connect live account at handoff |
| Stack | **Next.js (App Router) + TypeScript + Tailwind**, deployed on **Vercel** |
| Booking record | Stripe + transactional email (Resend). **No database for v1.** |
| Palette | Builder's pick — warm Maui boutique (defined below) |

## 3. Site map & navigation

- **Home** — hero (rating badge + suite photo + headline + dual CTA), featured suites,
  amenities strip, about teaser, location blurb, testimonials (if scraped), CTA band, footer.
- **Suites** — filterable grid of every unit. Filter repurposed to something meaningful for
  a building of 1BR private suites: **by guest capacity (2 / 3 / 4 / 5+)** plus a **Featured** toggle.
- **Suite detail** (dynamic `/suites/[slug]`) — photo gallery, description, amenities, rating,
  **booking widget** (dates + guests + live price breakdown), location blurb.
- **Checkout** (`/book/[slug]`) — guest details + Stripe Payment Element → confirmation page (`/book/[slug]/confirmed`).
- **About** — Waena Inn story, Wailuku/Maui location, kamaʻāina-host angle.
- **Contact** — email, contact form, location.
- **Footer/legal** — Privacy Policy, Terms & Conditions, Cookie preferences (carried over).
- **Nav:** `Waena Inn` logo · Home · Suites · About · Contact · **[ Book a Stay ]** button.

## 4. Visual design system

Honors the reference's warm minimalist boutique feel with a restrained island duo-accent.

**Palette**
- Sand/Ivory `#F6F1E9` — page background
- Espresso `#2B201A` — dark sections, primary text
- Clay/Terracotta `#B5683E` — primary CTAs
- Palm/Deep Teal `#27514A` — secondary accent
- Taupe `#D9CFC2` — cards, borders, dividers

**Typography**
- Headings: distinctive rounded-geometric display (General Sans, via Fontshare, free) — keeps
  the reference's bold rounded headline look while avoiding a generic feel.
- Body: clean humanist sans (Satoshi / Inter) with system fallbacks.

**Components**
- Rating pill, rounded-corner cards with soft shadows, amenity icon rows, sticky booking widget,
  generous whitespace, tasteful scroll-reveal and hover-lift motion. Real scraped photos throughout.

**Accessibility:** WCAG 2.1 AA — verified color contrast (esp. on dark espresso sections),
keyboard-navigable booking flow, focus states, alt text on suite photos.

## 5. Content & data model

Scrape pipeline (Playwright renders the JS site, extracts data, downloads images to repo):

**Suite content** (`/content/suites/*.json`, Zod-validated):
```
id, name, slug, summary, description,
photos[] (downloaded to /public/suites/<slug>/),
pricePerNight, cleaningFee, maxGuests, bedrooms, bathrooms, beds,
rating, reviewCount, amenities[], airbnbUrl?, blockedDates[]
```

**Global content:** brand, tagline, hero copy, about story, amenities master list,
testimonials[], contact email (`uncletonyshale@gmail.com`), phone/address (TBD).

**Placeholders:** anywhere the live site lacks data (blank About text, missing prices),
mark a clearly-labeled placeholder for the client to fill. Reused photos are the client's own.

## 6. Booking & payment flow

1. Suite page: guest picks **check-in/out + guests** → live breakdown:
   `nights × rate + cleaning fee + Hawaii GET/TAT (configurable, default ≈ 17.75%)`.
   Validation: check-out > check-in, min-nights, guests ≤ maxGuests, not in `blockedDates`.
2. Checkout: guest info (name, email, phone, message) + **Stripe Payment Element**.
   Server creates a **PaymentIntent with `capture_method: manual`** → card **authorized, not charged**.
3. **Webhook** (`/api/stripe/webhook`) records the booking and **emails the host** (Resend) the
   suite, dates, guest, and total. Guest sees a confirmation page + email:
   *"Request received — your card is authorized, not charged until we confirm your dates."*
4. Host **confirms (capture)** or **cancels (release authorization)** from the Stripe dashboard.
   No custom admin UI in v1.
5. **Blocked-dates file** per suite lets the host hand-grey known-taken dates without a DB.

## 7. Tech architecture

- **Next.js (App Router) + TypeScript + Tailwind CSS.**
- Suite data: typed in-repo content + Zod validation. No database.
- API routes: `POST /api/checkout` (create PaymentIntent), `POST /api/stripe/webhook` (record + email).
- Email: Resend (env-configured; swappable for SMTP).
- **Env vars:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `HOST_EMAIL`, `TAX_RATE`, `CLEANING_FEE`.
- **SEO:** per-suite metadata + OpenGraph, `sitemap.xml`, `robots.txt`, schema.org
  `LodgingBusiness` + `Accommodation` + `AggregateRating`.
- **Deploy:** Vercel, `git push` auto-deploy. Domain wired at handoff.

## 8. Testing & verification

- Unit tests on the price/tax/fee math.
- Stripe **test-mode** end-to-end booking with test cards (auth + capture + cancel).
- Email-delivery check.
- Responsive (mobile/tablet/desktop) + dark-section contrast + a11y (WCAG AA) pass.
- Browser-preview verification of each page before handoff.

## 9. Out of scope for v1 (YAGNI)

Live availability / channel sync, PMS integration (Hostaway/Guesty/etc.), guest accounts,
on-site review submission, CMS admin UI, live-mode payments (until client's Stripe is connected),
multi-language.

## 10. Open values needed from client (placeholders until provided)

- **Cleaning fee** (flat per stay).
- **Exact tax rate** (default Maui GET 4.5% + TAT 10.25% + county 3% ≈ 17.75%).
- **Phone & street address** to publish (live site lists neither) — else email-only.
- **Domain** for deployment.
- **Live Stripe + Resend keys** at handoff.
