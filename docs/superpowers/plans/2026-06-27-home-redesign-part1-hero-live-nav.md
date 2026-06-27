# Home Redesign Part 1 — Cinematic Hero + Live Layer + Nav — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the split editorial hero with a full-screen cinematic golden-hour hero backed by a real live-data layer (Maui time, sunset/golden-hour, weather), and make the nav transparent over the hero and solid on scroll.

**Architecture:** Pure, unit-tested astronomy in `lib/sun.ts`; a keyless client weather fetch in `lib/weather.ts`; a `LiveGoldenHour` client island that renders chips with an SSR-safe fallback; a `Nav` upgraded with a scroll sentinel; the hero rebuilt in `page.tsx` with new CSS in `globals.css`. SSG is preserved — only the live bits hydrate.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React, Tailwind v4 (`@theme` tokens in `globals.css`), Fraunces + Hanken Grotesk, Vitest.

Reference: spec at `docs/superpowers/specs/2026-06-27-home-redesign-design.md`; approved hero comp at `scratchpad/proto/hero.html` (outside repo).

**Conventions for every task:** run `git pull --rebase` is NOT needed mid-plan (single machine session), but **do not push** — the site auto-deploys on push; pushing happens only after the full part is verified and the user approves. Commit locally after each task.

---

## File structure

**Create**
- `src/lib/sun.ts` — pure sunrise/sunset/golden-hour math + tz formatting
- `src/lib/sun.test.ts` — vitest unit tests
- `src/lib/weather.ts` — keyless Open-Meteo current-weather fetch (client)
- `src/lib/weather.test.ts` — vitest unit tests (mocked fetch)
- `src/components/LiveGoldenHour.tsx` — `'use client'` island (clock, golden-hour countdown, weather chips)

**Modify**
- `src/components/Nav.tsx` — transparent-over-hero → solid-on-scroll
- `src/app/page.tsx` — hero section (lines ~87–172) replaced
- `src/app/globals.css` — hero + nav utility classes

---

## Task 1: `lib/sun.ts` — sunrise/sunset/golden-hour (TDD)

**Files:**
- Create: `src/lib/sun.ts`
- Test: `src/lib/sun.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/sun.test.ts
import { describe, it, expect } from 'vitest'
import { getSunTimes, formatInTZ, WAILUKU } from './sun'

describe('getSunTimes (Wailuku, Maui)', () => {
  // Summer solstice 2026 — local noon HST as the reference date
  const d = new Date('2026-06-21T22:00:00Z') // ~12:00 HST
  const t = getSunTimes(d, WAILUKU.lat, WAILUKU.lng)

  it('orders sunrise < goldenHourStart < sunset', () => {
    expect(t.sunrise.getTime()).toBeLessThan(t.goldenHourStart.getTime())
    expect(t.goldenHourStart.getTime()).toBeLessThan(t.sunset.getTime())
  })

  it('sunset falls in the early evening HST (18:00–20:00)', () => {
    const hhmm = formatInTZ(t.sunset, WAILUKU.tz, true) // 24h "HH:MM"
    const hour = Number(hhmm.split(':')[0])
    expect(hour).toBeGreaterThanOrEqual(18)
    expect(hour).toBeLessThanOrEqual(20)
  })

  it('golden hour starts roughly 30–70 min before sunset', () => {
    const gapMin = (t.sunset.getTime() - t.goldenHourStart.getTime()) / 60000
    expect(gapMin).toBeGreaterThan(25)
    expect(gapMin).toBeLessThan(75)
  })

  it('formatInTZ renders a 12h time like "7:01 PM"', () => {
    expect(formatInTZ(t.sunset, WAILUKU.tz)).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/sun.test.ts`
Expected: FAIL — `Cannot find module './sun'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/sun.ts
// Pure sunrise/sunset/golden-hour math (SunCalc-derived, no dependencies).
// Golden-hour start = evening moment the sun descends through 6° altitude.

export const WAILUKU = { lat: 20.8893, lng: -156.5047, tz: 'Pacific/Honolulu' }

const PI = Math.PI
const rad = PI / 180
const dayMs = 86400000
const J1970 = 2440588
const J2000 = 2451545
const e = rad * 23.4397 // obliquity of the ecliptic

const toJulian = (date: Date) => date.valueOf() / dayMs - 0.5 + J1970
const fromJulian = (j: number) => new Date((j + 0.5 - J1970) * dayMs)
const toDays = (date: Date) => toJulian(date) - J2000

const declination = (l: number, b: number) =>
  Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l))

const solarMeanAnomaly = (d: number) => rad * (357.5291 + 0.98560028 * d)

const eclipticLongitude = (M: number) => {
  const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M))
  const P = rad * 102.9372
  return M + C + P + PI
}

const J0 = 0.0009
const julianCycle = (d: number, lw: number) => Math.round(d - J0 - lw / (2 * PI))
const approxTransit = (Ht: number, lw: number, n: number) => J0 + (Ht + lw) / (2 * PI) + n
const solarTransitJ = (ds: number, M: number, L: number) =>
  J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L)
const hourAngle = (h: number, phi: number, dec: number) =>
  Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)))

export interface SunTimes {
  sunrise: Date
  sunset: Date
  goldenHourStart: Date
}

export function getSunTimes(date: Date, lat = WAILUKU.lat, lng = WAILUKU.lng): SunTimes {
  const lw = rad * -lng
  const phi = rad * lat
  const d = toDays(date)
  const n = julianCycle(d, lw)
  const ds = approxTransit(0, lw, n)
  const M = solarMeanAnomaly(ds)
  const L = eclipticLongitude(M)
  const dec = declination(L, 0)
  const Jnoon = solarTransitJ(ds, M, L)

  const setFor = (hDeg: number) => {
    const w = hourAngle(hDeg * rad, phi, dec)
    const a = approxTransit(w, lw, n)
    return solarTransitJ(a, M, L)
  }

  const Jsunset = setFor(-0.833)
  const Jgolden = setFor(6)
  return {
    sunrise: fromJulian(Jnoon - (Jsunset - Jnoon)),
    sunset: fromJulian(Jsunset),
    goldenHourStart: fromJulian(Jgolden),
  }
}

// Format an instant as a clock string in a target timezone.
// twentyFour=true → "HH:MM" (24h); otherwise → "7:01 PM".
export function formatInTZ(date: Date, tz = WAILUKU.tz, twentyFour = false): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: twentyFour ? '2-digit' : 'numeric',
    minute: '2-digit',
    hour12: !twentyFour,
  }).format(date)
}

// Human countdown like "in 3h 11m" / "in 42m" / null once passed.
export function countdownTo(target: Date, now: Date = new Date()): string | null {
  const ms = target.getTime() - now.getTime()
  if (ms <= 0) return null
  const mins = Math.round(ms / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `in ${h}h ${m}m` : `in ${m}m`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/sun.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/sun.ts src/lib/sun.test.ts
git commit -m "feat(lib): sunrise/sunset/golden-hour math for Wailuku (tested)"
```

---

## Task 2: `lib/weather.ts` — keyless current weather (TDD)

**Files:**
- Create: `src/lib/weather.ts`
- Test: `src/lib/weather.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/weather.test.ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { getMauiWeather, weatherText } from './weather'

afterEach(() => vi.restoreAllMocks())

describe('weatherText', () => {
  it('maps WMO codes to short labels', () => {
    expect(weatherText(0)).toBe('clear')
    expect(weatherText(3)).toBe('overcast')
    expect(weatherText(61)).toBe('rain')
    expect(weatherText(999)).toBe('—')
  })
})

describe('getMauiWeather', () => {
  it('returns tempF + condition on success', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ current: { temperature_2m: 78.4, weather_code: 0 } }),
    })))
    const w = await getMauiWeather()
    expect(w).toEqual({ tempF: 78, condition: 'clear' })
  })

  it('returns null on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    expect(await getMauiWeather()).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network') }))
    expect(await getMauiWeather()).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/weather.test.ts`
Expected: FAIL — `Cannot find module './weather'`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/weather.ts
// Keyless current weather for Wailuku via Open-Meteo. Client-only; never throws.
import { WAILUKU } from './sun'

export interface MauiWeather {
  tempF: number
  condition: string
}

const URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${WAILUKU.lat}&longitude=${WAILUKU.lng}` +
  `&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=${encodeURIComponent(WAILUKU.tz)}`

// Condensed WMO weather-code → short label.
export function weatherText(code: number): string {
  if (code === 0) return 'clear'
  if (code === 1 || code === 2) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if (code >= 45 && code <= 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if (code >= 61 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'showers'
  if (code >= 95) return 'storms'
  return '—'
}

export async function getMauiWeather(): Promise<MauiWeather | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(URL, { signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    const data = await res.json()
    const c = data?.current
    if (!c || typeof c.temperature_2m !== 'number') return null
    return { tempF: Math.round(c.temperature_2m), condition: weatherText(c.weather_code) }
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/weather.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/weather.ts src/lib/weather.test.ts
git commit -m "feat(lib): keyless Open-Meteo current weather (tested, never throws)"
```

---

## Task 3: `LiveGoldenHour` client island

**Files:**
- Create: `src/components/LiveGoldenHour.tsx`

Renders three chips: golden hour (sunset time + countdown), Wailuku clock, weather. Server renders sunset/clock from `getSunTimes`/`formatInTZ` for the request time (no blank flash); on mount it ticks the clock/countdown and fetches weather. Reduced-motion: still shows values, just polls at 60s instead of animating.

- [ ] **Step 1: Write the component**

```tsx
// src/components/LiveGoldenHour.tsx
'use client'
import { useEffect, useState } from 'react'
import { getSunTimes, formatInTZ, countdownTo, WAILUKU } from '@/lib/sun'
import { getMauiWeather, type MauiWeather } from '@/lib/weather'

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="text-brasslt">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  )
}

export function LiveGoldenHour() {
  // Initial values computed once for first paint (SSR + first client render match).
  const [now, setNow] = useState(() => new Date())
  const [weather, setWeather] = useState<MauiWeather | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const period = reduce ? 60000 : 30000
    const id = setInterval(() => setNow(new Date()), period)
    getMauiWeather().then(setWeather)
    return () => clearInterval(id)
  }, [])

  const { sunset } = getSunTimes(now)
  const sunsetStr = formatInTZ(sunset, WAILUKU.tz)
  const countdown = countdownTo(sunset, now)
  const clock = formatInTZ(now, WAILUKU.tz)

  return (
    <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-sand/90">
      <span className="inline-flex items-center gap-2 rounded-full border border-brass/30 bg-ink/30 px-3.5 py-1.5 backdrop-blur">
        <SunIcon /> Golden hour <b className="font-medium text-sand">{sunsetStr}</b>
        {countdown && <span className="text-sand/60">· {countdown}</span>}
      </span>
      <span className="inline-flex items-center gap-2 rounded-full border border-brass/30 bg-ink/30 px-3.5 py-1.5 backdrop-blur">
        Wailuku <b className="font-medium text-sand">{clock}</b>
      </span>
      {weather && (
        <span className="inline-flex items-center gap-2 rounded-full border border-brass/30 bg-ink/30 px-3.5 py-1.5 backdrop-blur">
          Now <b className="font-medium text-sand">{weather.tempF}°F</b>
          <span className="text-sand/60">· {weather.condition}</span>
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/LiveGoldenHour.tsx
git commit -m "feat(home): LiveGoldenHour island — Maui clock, golden-hour countdown, weather"
```

---

## Task 4: `Nav` — transparent over hero, solid on scroll

**Files:**
- Modify: `src/components/Nav.tsx` (full replacement below)

The home page renders a sentinel `<div id="hero-top">` at the very top; Nav observes it. While the sentinel is in view (hero on screen) the bar is transparent with sand text; once scrolled past, it goes solid sand. Inner pages have no sentinel → Nav defaults to solid immediately.

- [ ] **Step 1: Replace the component**

```tsx
// src/components/Nav.tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SITE } from '@/lib/site'
import { CenterMark } from './CenterMark'

export function Nav() {
  const [overHero, setOverHero] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('hero-top')
    if (!sentinel) return // inner pages: stay solid
    setOverHero(true)
    const io = new IntersectionObserver(
      ([entry]) => setOverHero(entry.isIntersecting),
      { rootMargin: '-72px 0px 0px 0px', threshold: 0 },
    )
    io.observe(sentinel)
    return () => io.disconnect()
  }, [])

  const solid = !overHero
  const headerCls = solid
    ? 'border-b border-line/70 bg-sand/85 text-espresso backdrop-blur-md'
    : 'border-b border-transparent bg-transparent text-sand'
  const linkCls = solid ? 'text-espresso/75 hover:text-espresso' : 'text-sand/85 hover:text-sand'

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${headerCls}`}>
      <nav className="container-page flex h-[4.5rem] items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5" aria-label={`${SITE.name} — home`}>
          <CenterMark className="h-4 w-4 text-clay transition-transform duration-500 group-hover:rotate-90" />
          <span className="font-display text-[1.35rem] font-medium tracking-tight">{SITE.name}</span>
        </Link>

        <ul className="hidden items-center gap-9 text-sm md:flex">
          {SITE.nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className={`link-underline inline-block py-2.5 ${linkCls}`}>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/suites"
          className={`hidden items-center gap-2 py-2.5 text-sm font-medium md:inline-flex ${solid ? 'text-espresso' : 'text-sand'}`}
        >
          <span className="link-underline">Reserve</span>
          <span aria-hidden className="text-clay">→</span>
        </Link>
      </nav>

      <div className={`overflow-x-auto border-t md:hidden ${solid ? 'border-line/50 bg-sand/90' : 'border-sand/15 bg-ink/30 backdrop-blur'}`}>
        <ul className="flex gap-6 px-5 text-sm whitespace-nowrap" role="list">
          {SITE.nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className={`block py-3 ${solid ? 'text-espresso/75 hover:text-clay' : 'text-sand/85 hover:text-sand'}`}>
                {n.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/suites" className={`block py-3 font-medium ${solid ? 'text-clay' : 'text-brasslt'}`}>
              Reserve →
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (Nav now renders identically on inner pages — solid — because the sentinel is absent.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat(nav): transparent over hero, solid on scroll (sentinel + IO)"
```

---

## Task 5: Rebuild the hero in `page.tsx` + hero CSS

**Files:**
- Modify: `src/app/globals.css` (append hero utilities)
- Modify: `src/app/page.tsx` (imports + replace hero `<section>` at lines ~87–172)

- [ ] **Step 1: Append hero CSS to `globals.css`**

Add at the end of `src/app/globals.css`:

```css
/* ── Cinematic hero ───────────────────────────────────────── */
.hero-fullbleed {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  isolation: isolate;
  overflow: hidden;
}
.hero-scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    180deg,
    rgba(26, 18, 12, 0.55) 0%,
    rgba(26, 18, 12, 0.1) 26%,
    rgba(26, 18, 12, 0.12) 48%,
    rgba(26, 18, 12, 0.62) 78%,
    rgba(26, 18, 12, 0.92) 100%
  );
}
.hero-scrollcue {
  position: absolute;
  left: 50%;
  bottom: 1.1rem;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.66rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(243, 237, 227, 0.55);
}
.hero-scrollcue .bar {
  width: 1px;
  height: 32px;
  background: linear-gradient(rgba(243, 237, 227, 0.55), transparent);
}
@media (max-width: 640px) {
  .hero-scrollcue { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-scrollcue .bar { background: rgba(243, 237, 227, 0.3); }
}
```

- [ ] **Step 2: Update imports in `page.tsx`**

At the top of `src/app/page.tsx`, add:

```tsx
import { LiveGoldenHour } from '@/components/LiveGoldenHour'
```

(Keep all existing imports: `Image`, `getAllSuites`, `SITE`, `Section`, `SuiteCard`, `Button`, `Reveal`, `HeroSearch`, `Reviews`, `Stars`, `Faq`, `JsonLd`, `getSiteContent`, `CenterMark`.)

- [ ] **Step 3: Replace the hero `<section>`**

Find the hero block (opens `{/* ===== Hero — type-forward editorial on deep material ===== */}` and its `<section className="relative isolate overflow-hidden bg-ink text-sand">…</section>`, ending just before `{/* ===== Ethos / philosophy ===== */}`). Replace the entire section with:

```tsx
      {/* ===== Hero — cinematic golden-hour arrival ===== */}
      <div id="hero-top" aria-hidden className="absolute top-0 h-px w-px" />
      <section className="hero-fullbleed bg-ink text-sand">
        <Image
          src="/hero-maui.jpg"
          alt="Golden hour over the ocean off Maui"
          fill
          priority
          sizes="100vw"
          className="-z-10 animate-kenburns object-cover [object-position:center_60%]"
          style={{ filter: 'saturate(0.92) contrast(1.06)' }}
        />
        <div className="hero-scrim" aria-hidden />

        <div className="container-page mt-auto pb-14 pt-10 sm:pb-20">
          <Reveal>
            <div className="flex items-center gap-3.5">
              <span aria-hidden className="h-px w-8 bg-brass/60" />
              <span className="eyebrow !text-brasslt">Wailuku · Maui, Hawaiʻi</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="display mt-6 text-[3rem] leading-[0.92] sm:text-[5rem] lg:text-[6.5rem]">
              The <em className="font-normal italic text-brasslt">center</em>
              <br />
              of Maui.
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sand/85">
              Kamaʻāina-hosted private suites in the heart of historic Wailuku — minutes from the
              airport, ʻĪao Valley, and Maui's best beaches.
            </p>
          </Reveal>

          <Reveal delay={210}>
            <LiveGoldenHour />
          </Reveal>

          <Reveal delay={280}>
            <div className="mt-7 max-w-2xl">
              <HeroSearch maxGuests={maxGuests} />
            </div>
          </Reveal>

          <Reveal delay={340}>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-sand/70">
              {avg > 0 && <span>★ {avg.toFixed(1)} guest rating</span>}
              <span aria-hidden className="text-sand/25">/</span>
              <span>{suites.length} private suites</span>
              <span aria-hidden className="text-sand/25">/</span>
              <span>8 min to OGG</span>
              <span aria-hidden className="text-sand/25">/</span>
              <span>Kamaʻāina-owned</span>
            </div>
          </Reveal>
        </div>

        <div className="hero-scrollcue" aria-hidden>
          Scroll
          <span className="bar" />
        </div>
      </section>
```

- [ ] **Step 4: Build to verify it compiles & prerenders**

Run: `npm run build`
Expected: success; `/` listed; no type errors. (If `CenterMark` import is now unused in `page.tsx`, remove it to satisfy lint.)

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat(home): full-screen cinematic golden-hour hero with live layer"
```

---

## Task 6: Verify (build + visual + a11y), then stop for review

**Files:** none (verification only). Uses a fresh production server + Chrome headless (dev server in this repo is flaky after long runs; production build is authoritative).

- [ ] **Step 1: Unit + build**

Run: `npx vitest run && npm run build`
Expected: all tests pass; build clean (37 routes).

- [ ] **Step 2: Serve the production build**

```bash
npx next start -p 3142
```
(Run in background. Wait for HTTP 200 on `http://localhost:3142/`.)

- [ ] **Step 3: Visual + checks via headless Chrome**

Write `scratchpad/verify-hero.js` that, for viewports 1366×900 and 390×844, loads `http://localhost:3142/`, waits 1.5s, and reports:
- `document.documentElement.scrollWidth - clientWidth` (expect 0),
- hero `<h1>` computed `font-size` (expect ≥ 48px desktop),
- presence of the three live chips text (`Golden hour`, `Wailuku`),
- nav background before scroll (transparent) vs after scrolling 800px (solid sand),
- full-page screenshots `scratchpad/hero_desktop.png`, `scratchpad/hero_mobile.png`.

Run it with `NODE_PATH` pointing at `frontline-social/node_modules` (puppeteer-core + system Chrome, per project CLAUDE.md). Read the two screenshots.

Expected: overflow 0 at both widths; chips present; nav transparent over hero, solid after scroll; hero legible (scrim) on both.

- [ ] **Step 4: Accessibility spot-check**

In the same script (or a second pass): emulate `prefers-reduced-motion: reduce` and confirm the hero image has no running kenburns animation (computed `animation-name: none`); confirm exactly one `<h1>`; confirm `header`, `main`, `footer` present; tab to the first `HeroSearch` control and confirm a visible focus outline.

Expected: all pass.

- [ ] **Step 5: Stop the server; do NOT push**

Stop the background `next start`. Report results + screenshots to the user. Pushing (which auto-deploys) happens only after the user reviews Part 1 and Part 2 is also ready, or on explicit instruction.

---

## Self-review (against the spec)

- **§4.1 Live layer** → Tasks 1–3 (sun.ts tested, weather.ts tested, LiveGoldenHour island with SSR-safe first paint + reduced-motion polling + graceful weather hide). ✓
- **§4.2 Nav** → Task 4 (transparent/solid via sentinel + IO; inner pages stay solid; mobile tap targets preserved at `py-3`). ✓
- **§4.3 Accessibility** → hero scrim in Task 5 CSS; reduced-motion handled in globals + LiveGoldenHour; single h1; focus check in Task 6. ✓
- **§4.4 Performance** → hero `priority`; weather deferred to `useEffect`; SSR fallback prevents CLS. ✓
- **§5.1 Hero** → Task 5 matches the approved comp. ✓
- **No fabricated data** → only time/sunset/weather, all real; no availability counters. ✓
- **Type consistency:** `getSunTimes`, `formatInTZ`, `countdownTo`, `WAILUKU`, `getMauiWeather`, `weatherText`, `MauiWeather` used consistently across Tasks 1–3. ✓
- **Out of scope here:** sections 2–9 (ethos, why, featured, suite reel, location, reviews, FAQ, CTA) are **Part 2** — a separate plan. Part 1 ships a working, verifiable hero on its own.
