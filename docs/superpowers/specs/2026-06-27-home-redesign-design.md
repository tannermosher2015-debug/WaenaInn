# Waena Inn — Home Page Redesign ("Warm Cinematic Editorial")

- **Date:** 2026-06-27
- **Status:** Approved design, ready for implementation planning
- **Scope:** Full home page (`/`) — hero through footer — plus shared Nav and a new live-data layer
- **Owner:** Frontline Web Designs

## 1. Context & problem

The current home page (commit `9d92595` "warm-editorial rebrand") opens on a split editorial hero — type on the left, a small brass-framed sunset photo on the right — and saves its only cinematic full-bleed moment for the closing CTA ~11,000px down. The result reads as a quiet magazine spread, not a "wow" arrival, and underuses the property's strongest asset (a graded golden-hour sunset photo).

The client (Tanner) asked for a **bold reinvention** with **cinematic imagery** and **live/interactive** wow, applied across the **entire** home page.

## 2. Goals / non-goals

**Goals**
- Open with an immersive, full-screen cinematic hero that leads with the sunset.
- Add a genuinely live, on-brand data layer (Maui time, today's sunrise→sunset, golden-hour countdown, current weather).
- Give the whole page a cinematic cadence (alternating dark immersive beats and light reading sections).
- Preserve booking intent — the date search stays prominent and routes to `/suites`.
- Hold WCAG 2.1 AA throughout (the project's non-negotiable bar).
- Keep the site statically generated (SSG); live data is client-side only.

**Non-goals**
- No booking backend / real availability. **No fabricated availability counters or any invented data.**
- No copy rewrite beyond small additions (headline stays "The center of Maui").
- No change to suite detail pages, `/about`, `/contact`, or legal pages.
- No new design dependency beyond a single keyless weather fetch.

## 3. Design language

A cohesive "warm cinematic editorial" system reused across sections:

- **Cadence:** dark immersive beats (hero → suite reel → location → closing CTA) interleaved with light reading sections (ethos, why, featured, reviews, FAQ). Page should feel like it breathes.
- **Imagery:** graded full-bleed photography (existing `.film` grade) at the dark beats; slow ken-burns + light parallax on key images.
- **Reveals:** `reveal-mask` wipe for imagery, `reveal` rise for text (both already fixed and working).
- **Motifs:** `CenterMark` crosshair, brass hairlines, index numerals (01 / 02 / 03), oversized Fraunces display moments.
- **Palette/fonts:** unchanged — Fraunces (display) + Hanken Grotesk (body); ink/espresso/sand/clay/brass tokens already in `globals.css`.

## 4. Cross-cutting systems

### 4.1 Live layer (`LiveGoldenHour` island)
A single `'use client'` component plus two pure libs. Rendered in the hero; a condensed echo allowed in the closing CTA.

- **`lib/sun.ts`** — pure, dependency-free. Computes sunrise, sunset, and golden-hour boundary for a given date + latitude/longitude, returning times in a specified IANA timezone. Coordinates: Wailuku **lat 20.8893, lon -156.5047**, tz `Pacific/Honolulu`. Algorithm: standard sunrise equation (NOAA/Meeus simplified) with −0.833° horizon refraction. "Golden hour" displayed as the sunset time with a live countdown; golden-hour window start defined as sun elevation ≈ 6° (approx sunset − ~50 min) for an optional "in progress" state.
  - Must be **unit tested** (vitest) against a known Maui sunset for a fixed date, tolerance ±3 min.
- **`lib/weather.ts`** — client-only fetch of Open-Meteo (keyless):
  `https://api.open-meteo.com/v1/forecast?latitude=20.8893&longitude=-156.5047&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=Pacific/Honolulu`
  Returns `{ tempF, condition }`. 4s timeout; on any failure resolves to `null` (chip hidden). No key, no PII.
- **`LiveGoldenHour.tsx`** — renders chips: golden-hour time + countdown, Maui local time (updates ≤ every 30s), weather (after fetch). SSR renders a static, sensible fallback (computed sunset for today, no weather) so there is no layout shift / no blank flash; hydration upgrades it. Countdown/clock ticking is paused under `prefers-reduced-motion` (value still shown, just not animating sub-minute).

### 4.2 Navigation
- `Nav` becomes transparent (sand text) while overlaying the hero, transitioning to the solid sand bar on scroll past the hero.
- Implementation: a scroll sentinel at the top of the hero observed via `IntersectionObserver`; toggle a `scrolled` class. Must work as a client island without breaking the existing sticky behavior on inner pages (inner pages have no hero → default to solid).
- Both states must pass contrast (sand on image-scrim vs espresso on sand). Mobile nav row keeps its current ≥44px tap targets.

### 4.3 Accessibility (every section)
- Text over imagery sits on a gradient scrim guaranteeing ≥4.5:1.
- `prefers-reduced-motion: reduce` disables ken-burns, parallax, reel autoplay, and sub-minute ticking.
- Semantic landmarks preserved; exactly one `<h1>` (hero).
- All interactive controls keyboard-operable with visible `:focus-visible`.
- Live chips have static text fallbacks; reel is operable by keyboard and not autoplay-only.
- Images have meaningful `alt`.

### 4.4 Performance
- Hero image keeps `priority`; other section images lazy.
- Weather fetch deferred to after hydration (non-blocking).
- Suite reel images lazy-loaded; only the active frame eager.
- No CLS from the live layer (SSR fallback reserves space).

## 5. Section-by-section requirements

1. **Hero** *(dark beat)* — full-viewport graded sunset (`hero-maui.jpg`), ken-burns + subtle parallax, transparent nav, oversized Fraunces headline ("The center of Maui"), subhead, **live golden-hour dock** (chips + glass date search routing to `/suites`), trust line, scroll cue. Matches the approved prototype (`scratchpad/proto/hero.html`).
2. **Ethos / philosophy** *(light)* — editorial pull-quote in large Fraunces; graded portrait image with parallax + mask reveal; small "Kamaʻāina-owned" brass seal.
3. **Why Waena (3 reasons)** *(light)* — replace boxy cards with a magazine row: index numerals (01/02/03), brass rules, `CenterMark` icons; keep the three existing reasons/copy.
4. **Featured suites** *(light)* — cinematic shoppable cards: larger imagery, hover zoom, nightly price + rating, mask reveal; asymmetric layout (e.g. 2-up + 1) rather than three equal boxes. Still links to each suite.
5. **Gallery → Suite reel** *(dark beat)* — new `SuiteReel`: full-bleed cross-fading reel of best suites + sunset, each frame labeled with suite name + nightly price, scrubbable filmstrip, autoplay that pauses on hover/focus and is disabled under reduced-motion. Replaces the current static mosaic. Frames link to the suite.
6. **Location interlude** *(dark)* — keep dark; stylized "minutes from everything" radial built from `CenterMark` spokes; embed the real Wailuku map (address now set: 1325 Lower Main St) styled to match; soft echo of live Maui time permitted.
7. **Reviews** *(light)* — editorial treatment: one large featured quote with a brass quotation mark + guest avatars; supporting grid below. Uses existing testimonials data.
8. **FAQ** *(light)* — keep the accordion; restyle to the system.
9. **Closing CTA** *(dark beat)* — refine existing full-bleed so it does **not** duplicate the hero (use `cta-sunset.jpg`/`cta-maui.jpg`); add a golden-hour-tied line ("Arrive in time for golden hour"); primary booking CTA. Optional condensed live echo.

## 6. Component architecture

**New**
- `src/lib/sun.ts` (pure, tested)
- `src/lib/weather.ts` (client fetch)
- `src/components/LiveGoldenHour.tsx` (`'use client'`)
- `src/components/SuiteReel.tsx` (`'use client'`)
- Possibly `src/components/HeroDock.tsx` (date search styled for the hero; can extend existing `HeroSearch`)

**Changed**
- `src/components/Nav.tsx` — transparent/solid scroll variant (client)
- `src/app/page.tsx` — restructured sections, new cadence
- `src/app/globals.css` — section/utility classes for the new treatments (seal, index numerals already partly present, reel, nav states)
- `src/components/Reveal.tsx` — reuse as-is (already fixed)
- Section refactors: Ethos, Why, Featured (SuiteCard), Location, Reviews, CTA

**Unchanged:** suite detail, about, contact, legal, Footer (already updated).

## 7. Data flow & states

- Server renders all sections statically (SSG) with live-layer fallbacks.
- On hydration: `LiveGoldenHour` recomputes sun times for the client's current date, starts the clock/countdown, fires the weather fetch.
- States: (a) SSR/no-JS → computed sunset shown, weather chip absent, reel shows first frame statically, nav solid; (b) hydrated, weather ok → all chips live; (c) weather fail → weather chip hidden, rest live; (d) reduced-motion → no ken-burns/parallax/autoplay, values static.

## 8. Testing & verification

- **Unit:** `sun.ts` sunrise/sunset for a fixed Maui date within ±3 min; golden-hour boundary ordering (sunrise < golden-hour-start < sunset).
- **Build:** `npm run build` clean; all 37 routes prerender.
- **Visual (puppeteer/Chrome headless):** desktop (1366) + mobile (390) screenshots of every section; zero horizontal overflow; reveals open; nav state toggles on scroll.
- **A11y spot-checks:** contrast of text-on-image, reduced-motion behavior, keyboard path through hero dock + reel, single h1, landmarks.
- **Live:** confirm Maui clock + sunset render with real values; weather chip appears or hides cleanly.

## 9. Assumptions & open questions

- **Assumption:** Open-Meteo (keyless, no signup) is acceptable as the single new runtime dependency. If not, the weather chip is dropped and the rest of the live layer stands.
- **Assumption:** existing photo assets are sufficient for the suite reel (25 suites have photos); no new photography required.
- **Open:** exact "golden hour" definition for display — leaning on "sunset time + countdown" with an optional "golden hour now" state during the ~50 min before sunset. Final wording to settle during implementation.

## 10. Out of scope
- Real-time availability / booking integration.
- Photography or copywriting beyond minor additions.
- Pages other than `/` (and the shared `Nav`).
