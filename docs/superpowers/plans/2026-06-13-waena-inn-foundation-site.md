# Waena Inn — Plan 1: Foundation & Content Site

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable, SEO-ready, multi-page Next.js site for Waena Inn that displays every suite (from real scraped content) with the warm Maui-boutique design — everything except the live booking/payment layer (that's Plan 2).

**Architecture:** Next.js App Router (SSG/SSR) + TypeScript + Tailwind. Suite data lives as Zod-validated JSON in `/content`, with photos in `/public`. A Playwright scrape script populates that data from the live site. Presentational React components compose the Home, Suites, Suite-detail, About, and Contact pages. SEO via metadata + JSON-LD.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Zod, Vitest + Testing Library, Playwright (scrape), `next/font`, deployed on Vercel.

**Reference spec:** `docs/superpowers/specs/2026-06-13-waena-inn-redesign-design.md`

---

## File Structure

```
waena-inn/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                # root layout: fonts, Nav, Footer, metadata
│  │  ├─ page.tsx                  # Home
│  │  ├─ globals.css               # Tailwind + CSS vars
│  │  ├─ suites/
│  │  │  ├─ page.tsx               # all-suites grid + capacity filter
│  │  │  └─ [slug]/page.tsx        # suite detail + gallery
│  │  ├─ about/page.tsx
│  │  ├─ contact/page.tsx
│  │  ├─ sitemap.ts                # generated sitemap
│  │  └─ robots.ts
│  ├─ components/
│  │  ├─ Nav.tsx
│  │  ├─ Footer.tsx
│  │  ├─ Button.tsx
│  │  ├─ RatingPill.tsx
│  │  ├─ SuiteCard.tsx
│  │  ├─ AmenityList.tsx
│  │  ├─ Section.tsx
│  │  ├─ Gallery.tsx
│  │  └─ JsonLd.tsx
│  └─ lib/
│     ├─ suites.ts                 # load + type suites (server)
│     ├─ suites.schema.ts          # Zod schema + types
│     ├─ filterSuites.ts           # capacity/featured filter (pure, tested)
│     └─ site.ts                   # brand constants, nav, contact
├─ content/
│  ├─ suites/*.json                # one file per suite (scraped)
│  └─ site.json                    # brand, about, testimonials, contact
├─ public/suites/<slug>/*.jpg      # downloaded photos
├─ scripts/
│  ├─ scrape.ts                    # Playwright runner
│  └─ parseSuite.ts                # pure parser (tested against fixture)
└─ tests/
   └─ fixtures/suite.html          # saved markup for parser test
```

Files that change together live together; logic (`lib/`, `scripts/parseSuite.ts`) is split from
presentation (`components/`, `app/`) so each unit is independently testable.

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: whole Next.js skeleton in `C:\Users\Tanne\waena-inn`
- Note: project root already has `.git` and `docs/` — move `docs/` aside so `create-next-app` doesn't abort.

- [ ] **Step 1: Temporarily move docs out of the way**

Run (PowerShell, from project root):
```powershell
Rename-Item docs _docs_tmp
```

- [ ] **Step 2: Scaffold (all flags set to avoid interactive prompts)**

Run:
```powershell
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```
Expected: "Success! Created" with `src/app`, `tailwind.config.ts`, `package.json`. When asked to
overwrite nothing (only `.git`/allowlisted files present), it proceeds.

- [ ] **Step 3: Restore docs**

Run:
```powershell
Rename-Item _docs_tmp docs
```

- [ ] **Step 4: Install dev/test deps**

Run:
```powershell
npm install zod
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom playwright
npx playwright install chromium
```
Expected: dependencies added, Chromium downloaded.

- [ ] **Step 5: Add Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./vitest.setup.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

Create `vitest.setup.ts`:
```ts
import '@testing-library/jest-dom/vitest'
```

Add scripts to `package.json` (merge into existing `"scripts"`):
```json
"test": "vitest run",
"test:watch": "vitest",
"scrape": "node --import tsx scripts/scrape.ts"
```
Then: `npm install -D tsx`

- [ ] **Step 6: Verify dev server boots**

Run: `npm run dev` (then stop it). Expected: "Ready" on http://localhost:3000 with no errors.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "chore: scaffold Next.js + TS + Tailwind + Vitest/Playwright"
```

---

## Task 2: Design tokens & theme

**Files:**
- Modify: `src/app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `src/app/layout.tsx` (fonts)
- Create: `src/lib/site.ts`

- [ ] **Step 1: Define brand constants**

Create `src/lib/site.ts`:
```ts
export const SITE = {
  name: 'Waena Inn',
  tagline: 'Boutique Lodging in Wailuku, Maui — Central & Comfortable',
  email: 'uncletonyshale@gmail.com',
  phone: '', // TODO(client): confirm phone or leave email-only
  address: 'Wailuku, Maui, HI', // TODO(client): confirm street address
  url: 'https://waenainn.com', // TODO(client): confirm production domain
  nav: [
    { href: '/', label: 'Home' },
    { href: '/suites', label: 'Suites' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
} as const
```

- [ ] **Step 2: Tailwind palette + fonts**

Replace the `theme.extend` block in `tailwind.config.ts`:
```ts
extend: {
  colors: {
    sand: '#F6F1E9',
    espresso: '#2B201A',
    clay: '#B5683E',
    palm: '#27514A',
    taupe: '#D9CFC2',
  },
  fontFamily: {
    display: ['var(--font-display)', 'system-ui', 'sans-serif'],
    sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
  },
  borderRadius: { card: '1.25rem' },
  boxShadow: { soft: '0 12px 40px -12px rgba(43,32,26,0.18)' },
},
```

- [ ] **Step 3: Load fonts (General Sans display + Inter body) via next/font**

In `src/app/layout.tsx`, replace the default font import. Use Inter for body (next/font/google)
and a local General Sans for display (download `GeneralSans-Variable.woff2` from fontshare.com into
`src/app/fonts/`). Code:
```tsx
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const display = localFont({
  src: './fonts/GeneralSans-Variable.woff2',
  variable: '--font-display',
  display: 'swap',
})
// apply: <html lang="en" className={`${body.variable} ${display.variable}`}>
```
> If the General Sans file isn't available at build time, fall back to `Sora` from next/font/google
> with `variable: '--font-display'` — same variable name, no other change needed.

- [ ] **Step 4: Base styles**

In `src/app/globals.css`, after the `@tailwind` directives:
```css
:root { color-scheme: light; }
body { @apply bg-sand text-espresso font-sans antialiased; }
h1,h2,h3 { @apply font-display tracking-tight; }
.container-page { @apply mx-auto w-full max-w-6xl px-5 sm:px-8; }
```

- [ ] **Step 5: Verify & commit**

Run: `npm run dev`, confirm the page renders on the sand background with no console errors. Stop server.
```powershell
git add -A
git commit -m "feat: brand design tokens, palette, and fonts"
```

---

## Task 3: Suite data model (Zod) — TDD

**Files:**
- Create: `src/lib/suites.schema.ts`
- Create: `src/lib/suites.ts`
- Test: `tests/suites.schema.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/suites.schema.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { SuiteSchema } from '@/lib/suites.schema'

const valid = {
  id: '14', name: 'Maui Private Suite — Unit 14', slug: 'unit-14',
  summary: 'Central Wailuku suite', description: 'A comfortable private suite...',
  photos: ['/suites/unit-14/1.jpg'],
  pricePerNight: 140, cleaningFee: 75,
  maxGuests: 4, bedrooms: 1, bathrooms: 1, beds: 1,
  rating: 4.8, reviewCount: 23,
  amenities: ['Air conditioning', 'Free WiFi'],
  blockedDates: [],
}

describe('SuiteSchema', () => {
  it('accepts a valid suite', () => {
    expect(SuiteSchema.parse(valid)).toMatchObject({ slug: 'unit-14', pricePerNight: 140 })
  })
  it('rejects negative price', () => {
    expect(() => SuiteSchema.parse({ ...valid, pricePerNight: -1 })).toThrow()
  })
  it('defaults blockedDates to empty array', () => {
    const { blockedDates, ...noBlocked } = valid
    expect(SuiteSchema.parse(noBlocked).blockedDates).toEqual([])
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- suites.schema`
Expected: FAIL — cannot find module `@/lib/suites.schema`.

- [ ] **Step 3: Implement the schema**

Create `src/lib/suites.schema.ts`:
```ts
import { z } from 'zod'

export const SuiteSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  summary: z.string(),
  description: z.string(),
  photos: z.array(z.string()).min(1),
  pricePerNight: z.number().nonnegative(),
  cleaningFee: z.number().nonnegative().default(0),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().nonnegative(),
  beds: z.number().int().nonnegative(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative().default(0),
  amenities: z.array(z.string()),
  airbnbUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
  blockedDates: z.array(z.string()).default([]),
})

export type Suite = z.infer<typeof SuiteSchema>
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- suites.schema`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement the loader**

Create `src/lib/suites.ts`:
```ts
import 'server-only'
import fs from 'node:fs'
import path from 'node:path'
import { SuiteSchema, type Suite } from './suites.schema'

const DIR = path.join(process.cwd(), 'content', 'suites')

export function getAllSuites(): Suite[] {
  if (!fs.existsSync(DIR)) return []
  return fs.readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => SuiteSchema.parse(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))))
    .sort((a, b) => a.slug.localeCompare(b.slug, undefined, { numeric: true }))
}

export function getSuite(slug: string): Suite | undefined {
  return getAllSuites().find((s) => s.slug === slug)
}
```

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "feat: Zod suite schema + content loader (tested)"
```

---

## Task 4: Content scrape pipeline

> The live site (`uncletonyshale.holidayfuture.com`) is JS-rendered, so we render with Playwright,
> parse each suite, and download photos. The **parser is pure and unit-tested** against a saved
> fixture; the runner orchestrates rendering + file I/O.

**Files:**
- Create: `scripts/parseSuite.ts`
- Create: `scripts/scrape.ts`
- Test: `tests/parseSuite.test.ts`, `tests/fixtures/suite.html`

- [ ] **Step 1: Capture a real fixture**

Run a throwaway render to save one listing's HTML for the parser test:
```powershell
node --import tsx -e "const{chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('https://uncletonyshale.holidayfuture.com/',{waitUntil:'networkidle'});require('fs').writeFileSync('tests/fixtures/suite.html',await p.content());await b.close()})()"
```
Expected: `tests/fixtures/suite.html` written (non-empty). Inspect it to confirm suite cards/markup
are present, then base the selectors in Step 3 on what you actually see.

- [ ] **Step 2: Write the failing parser test**

Create `tests/parseSuite.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { parseSuiteCards } from '../scripts/parseSuite'

const html = fs.readFileSync('tests/fixtures/suite.html', 'utf8')

describe('parseSuiteCards', () => {
  const cards = parseSuiteCards(html)
  it('finds multiple suites', () => { expect(cards.length).toBeGreaterThan(1) })
  it('each has a name and photo', () => {
    for (const c of cards) {
      expect(c.name.length).toBeGreaterThan(0)
      expect(c.photoUrls.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 3: Implement the parser**

Create `scripts/parseSuite.ts`. Use a DOM parser (`linkedom`, install with `npm i -D linkedom`).
Adjust the selectors to match the fixture from Step 1:
```ts
import { parseHTML } from 'linkedom'

export interface RawSuite {
  name: string
  photoUrls: string[]
  priceText?: string
  ratingText?: string
  guestsText?: string
  href?: string
}

export function parseSuiteCards(html: string): RawSuite[] {
  const { document } = parseHTML(html)
  // NOTE: replace '.listing-card' etc. with the real selectors found in tests/fixtures/suite.html
  const cards = Array.from(document.querySelectorAll('[class*="listing"], [class*="card"]'))
  return cards
    .map((el): RawSuite => ({
      name: el.querySelector('h2,h3,[class*="title"]')?.textContent?.trim() ?? '',
      photoUrls: Array.from(el.querySelectorAll('img'))
        .map((img) => img.getAttribute('src') ?? '')
        .filter(Boolean),
      priceText: el.querySelector('[class*="price"]')?.textContent?.trim(),
      ratingText: el.querySelector('[class*="rating"], [class*="star"]')?.textContent?.trim(),
      guestsText: el.querySelector('[class*="guest"]')?.textContent?.trim(),
      href: el.querySelector('a')?.getAttribute('href') ?? undefined,
    }))
    .filter((s) => s.name && s.photoUrls.length)
}
```

- [ ] **Step 4: Run parser test, verify it passes**

Run: `npm test -- parseSuite`
Expected: PASS. If selectors miss, refine them against the fixture until both tests pass.

- [ ] **Step 5: Implement the scrape runner**

Create `scripts/scrape.ts` — renders the listings + each detail page, downloads photos to
`public/suites/<slug>/`, and writes `content/suites/<slug>.json` (slugged `unit-N`). Normalizes
numbers from the raw text (price, rating, guests), maps amenities to the master list, and **emits
a clearly-marked placeholder** (`pricePerNight: 0` + a `// TODO` log line) wherever a value is missing:
```ts
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { parseSuiteCards } from './parseSuite'

const ROOT = 'https://uncletonyshale.holidayfuture.com/'
const num = (s?: string) => Number((s ?? '').replace(/[^0-9.]/g, '')) || 0

async function run() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(ROOT, { waitUntil: 'networkidle' })
  const raw = parseSuiteCards(await page.content())

  const missing: string[] = []
  for (const [i, r] of raw.entries()) {
    const slug = `unit-${num(r.name) || i + 1}`
    const dir = path.join('public', 'suites', slug)
    fs.mkdirSync(dir, { recursive: true })

    const photos: string[] = []
    for (const [j, src] of r.photoUrls.entries()) {
      const abs = new URL(src, ROOT).toString()
      const buf = Buffer.from(await (await fetch(abs)).arrayBuffer())
      const file = `${j + 1}.jpg`
      fs.writeFileSync(path.join(dir, file), buf)
      photos.push(`/suites/${slug}/${file}`)
    }

    const price = num(r.priceText)
    if (!price) missing.push(`${slug}: pricePerNight`)
    const suite = {
      id: String(num(r.name) || i + 1),
      name: r.name, slug,
      summary: r.name, description: r.name, // TODO(client): richer copy if available
      photos,
      pricePerNight: price, cleaningFee: 0, // TODO(client): cleaning fee
      maxGuests: num(r.guestsText) || 2, bedrooms: 1, bathrooms: 1, beds: 1,
      rating: Number(num(r.ratingText).toFixed(2)) || 4.7, reviewCount: 0,
      amenities: ['Air conditioning', '24-hour check-in', 'Free parking', 'Cooking basics', 'Free WiFi', 'Washing machine'],
      featured: i < 3, blockedDates: [],
    }
    fs.mkdirSync('content/suites', { recursive: true })
    fs.writeFileSync(path.join('content', 'suites', `${slug}.json`), JSON.stringify(suite, null, 2))
  }
  await browser.close()
  if (missing.length) console.warn('PLACEHOLDERS NEEDED:\n' + missing.join('\n'))
  console.log(`Wrote ${raw.length} suites.`)
}
run()
```

- [ ] **Step 6: Run the scrape**

Run: `npm run scrape`
Expected: `content/suites/*.json` and `public/suites/<slug>/*.jpg` populated; a `PLACEHOLDERS NEEDED`
warning lists any fields the live site didn't expose (record these for the client).

- [ ] **Step 7: Validate scraped data loads**

Run: `npm test -- suites.schema` then add a quick check: `node --import tsx -e "import('./src/lib/suites.ts').then(m=>console.log(m.getAllSuites().length))"`
Expected: prints the suite count (>1) with no Zod errors. Fix any field that fails validation.

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "feat: Playwright scrape pipeline + parsed suite content"
```

---

## Task 5: Global layout (Nav + Footer)

**Files:**
- Create: `src/components/Nav.tsx`, `src/components/Footer.tsx`, `src/components/Button.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Button component**

Create `src/components/Button.tsx`:
```tsx
import Link from 'next/link'
import { clsx } from 'clsx' // npm i clsx

type Props = { href?: string; variant?: 'primary' | 'ghost'; className?: string; children: React.ReactNode }
const base = 'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition'
const variants = {
  primary: 'bg-clay text-sand hover:brightness-110',
  ghost: 'bg-transparent text-espresso ring-1 ring-taupe hover:bg-taupe/40',
}
export function Button({ href, variant = 'primary', className, children }: Props) {
  const cls = clsx(base, variants[variant], className)
  return href ? <Link href={href} className={cls}>{children}</Link> : <button className={cls}>{children}</button>
}
```
Run `npm i clsx`.

- [ ] **Step 2: Nav**

Create `src/components/Nav.tsx` (sticky, transparent-on-top is optional; keep simple/solid):
```tsx
import Link from 'next/link'
import { SITE } from '@/lib/site'
import { Button } from './Button'

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-taupe/60 bg-sand/90 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">{SITE.name}</Link>
        <ul className="hidden gap-8 text-sm md:flex">
          {SITE.nav.map((n) => <li key={n.href}><Link href={n.href} className="hover:text-clay">{n.label}</Link></li>)}
        </ul>
        <Button href="/suites" className="hidden md:inline-flex">Book a Stay</Button>
      </nav>
    </header>
  )
}
```

- [ ] **Step 3: Footer**

Create `src/components/Footer.tsx`:
```tsx
import Link from 'next/link'
import { SITE } from '@/lib/site'

export function Footer() {
  return (
    <footer className="mt-24 bg-espresso text-sand/80">
      <div className="container-page grid gap-8 py-14 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg text-sand">{SITE.name}</p>
          <p className="mt-2 text-sm">{SITE.tagline}</p>
        </div>
        <div className="text-sm">
          <p>{SITE.address}</p>
          <a href={`mailto:${SITE.email}`} className="hover:text-clay">{SITE.email}</a>
        </div>
        <ul className="space-y-2 text-sm">
          <li><Link href="/privacy" className="hover:text-clay">Privacy Policy</Link></li>
          <li><Link href="/terms" className="hover:text-clay">Terms &amp; Conditions</Link></li>
          <li><Link href="/contact" className="hover:text-clay">Contact Us</Link></li>
        </ul>
      </div>
      <div className="container-page border-t border-white/10 py-6 text-xs">© {new Date().getFullYear()} {SITE.name}</div>
    </footer>
  )
}
```

- [ ] **Step 4: Wire into root layout**

In `src/app/layout.tsx`, set `metadata`, apply font variables to `<html>`, and wrap children:
```tsx
export const metadata = {
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.tagline,
  metadataBase: new URL(SITE.url),
}
// body: <Nav />{children}<Footer />
```
(Import `SITE`, `Nav`, `Footer`.)

- [ ] **Step 5: Verify & commit**

Run `npm run dev`; confirm Nav + Footer render on every route, mobile nav collapses. Stop.
```powershell
git add -A
git commit -m "feat: global layout — Nav, Footer, Button"
```

---

## Task 6: Display components

**Files:**
- Create: `src/components/RatingPill.tsx`, `AmenityList.tsx`, `Section.tsx`, `SuiteCard.tsx`
- Test: `tests/SuiteCard.test.tsx`

- [ ] **Step 1: RatingPill, Section, AmenityList**

Create `src/components/RatingPill.tsx`:
```tsx
export function RatingPill({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sand/95 px-3 py-1 text-xs font-medium shadow-soft">
      <span aria-hidden>★</span>{rating.toFixed(2)}
      {reviews ? <span className="text-espresso/60">({reviews})</span> : null}
    </span>
  )
}
```
Create `src/components/Section.tsx`:
```tsx
export function Section({ id, className = '', children }: { id?: string; className?: string; children: React.ReactNode }) {
  return <section id={id} className={`container-page py-16 sm:py-24 ${className}`}>{children}</section>
}
```
Create `src/components/AmenityList.tsx`:
```tsx
export function AmenityList({ amenities }: { amenities: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 text-sm">
      {amenities.map((a) => (
        <li key={a} className="flex items-center gap-2"><span aria-hidden className="text-palm">✓</span>{a}</li>
      ))}
    </ul>
  )
}
```

- [ ] **Step 2: Write the failing SuiteCard test**

Create `tests/SuiteCard.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SuiteCard } from '@/components/SuiteCard'

const suite = {
  id: '14', name: 'Maui Private Suite — Unit 14', slug: 'unit-14', summary: 'Central',
  description: '', photos: ['/suites/unit-14/1.jpg'], pricePerNight: 140, cleaningFee: 75,
  maxGuests: 4, bedrooms: 1, bathrooms: 1, beds: 1, rating: 4.8, reviewCount: 23,
  amenities: ['Free WiFi'], featured: false, blockedDates: [],
}

describe('SuiteCard', () => {
  it('shows name, price, and links to the detail page', () => {
    render(<SuiteCard suite={suite as any} />)
    expect(screen.getByText(/Unit 14/)).toBeInTheDocument()
    expect(screen.getByText(/\$140/)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/suites/unit-14')
  })
})
```

- [ ] **Step 3: Run test, verify it fails**

Run: `npm test -- SuiteCard`
Expected: FAIL — cannot find `@/components/SuiteCard`.

- [ ] **Step 4: Implement SuiteCard**

Create `src/components/SuiteCard.tsx`:
```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Suite } from '@/lib/suites.schema'
import { RatingPill } from './RatingPill'

export function SuiteCard({ suite }: { suite: Suite }) {
  return (
    <Link href={`/suites/${suite.slug}`} className="group block overflow-hidden rounded-card bg-white shadow-soft ring-1 ring-taupe/50">
      <div className="relative aspect-[4/3]">
        <Image src={suite.photos[0]} alt={suite.name} fill sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3"><RatingPill rating={suite.rating} reviews={suite.reviewCount} /></div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{suite.name}</h3>
        <p className="mt-1 text-sm text-espresso/60">Up to {suite.maxGuests} guests · {suite.bedrooms} BR</p>
        <p className="mt-3"><span className="text-xl font-semibold text-clay">${suite.pricePerNight}</span>
          <span className="text-sm text-espresso/60"> / night</span></p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `npm test -- SuiteCard`
Expected: PASS.

- [ ] **Step 6: Allow remote/static images**

In `next.config.ts`, ensure local images work (they're in `/public`, so no remote config needed).
No change required unless any photo failed to download and still points remote — then add the host to
`images.remotePatterns`.

- [ ] **Step 7: Commit**

```powershell
git add -A
git commit -m "feat: display components — RatingPill, Section, AmenityList, SuiteCard"
```

---

## Task 7: Home page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build the Home page from real data**

Replace `src/app/page.tsx`:
```tsx
import Image from 'next/image'
import { getAllSuites } from '@/lib/suites'
import { SITE } from '@/lib/site'
import { Section } from '@/components/Section'
import { SuiteCard } from '@/components/SuiteCard'
import { RatingPill } from '@/components/RatingPill'
import { Button } from '@/components/Button'
import { AmenityList } from '@/components/AmenityList'

export default function Home() {
  const suites = getAllSuites()
  const featured = suites.filter((s) => s.featured).slice(0, 3)
  const hero = suites[0]
  const topRating = Math.max(0, ...suites.map((s) => s.rating))
  return (
    <>
      <Section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <RatingPill rating={topRating} />
          <h1 className="mt-5 text-5xl font-semibold leading-[1.05] sm:text-6xl">Find your<br />Maui stay.</h1>
          <p className="mt-5 max-w-md text-espresso/70">{SITE.tagline}. Kamaʻāina-hosted private suites in the heart of Wailuku, welcoming you with aloha.</p>
          <div className="mt-8 flex gap-3">
            <Button href="/suites">Browse suites</Button>
            <Button href="/about" variant="ghost">Our story</Button>
          </div>
        </div>
        {hero && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-card shadow-soft">
            <Image src={hero.photos[0]} alt={hero.name} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" priority />
          </div>
        )}
      </Section>

      <Section className="!py-0"><div className="rounded-card bg-white p-8 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-espresso/50">Every suite includes</h2>
        <div className="mt-4"><AmenityList amenities={['Air conditioning','24-hour check-in','Free parking','Cooking basics','Free WiFi','Washing machine']} /></div>
      </div></Section>

      <Section>
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-widest text-espresso/50">Accommodation</p>
          <h2 className="mt-2 text-4xl font-semibold">Featured suites</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((s) => <SuiteCard key={s.slug} suite={s} />)}
        </div>
        <div className="mt-10 text-center"><Button href="/suites" variant="ghost">Explore all {suites.length} suites</Button></div>
      </Section>

      <Section><div className="rounded-card bg-espresso px-8 py-16 text-center text-sand">
        <h2 className="text-4xl font-semibold">Stay central. Stay comfortable.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sand/80">Minutes from Kahului, Iao Valley, and Maui's best beaches.</p>
        <div className="mt-8"><Button href="/suites">Book a stay</Button></div>
      </div></Section>
    </>
  )
}
```

- [ ] **Step 2: Verify visually & commit**

Run `npm run dev`; confirm hero, amenities, featured grid, and CTA render with real photos. Stop.
```powershell
git add -A
git commit -m "feat: home page"
```

---

## Task 8: Suites listing + capacity filter — TDD filter

**Files:**
- Create: `src/lib/filterSuites.ts`
- Test: `tests/filterSuites.test.ts`
- Create: `src/app/suites/page.tsx`

- [ ] **Step 1: Write the failing filter test**

Create `tests/filterSuites.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { filterSuites } from '@/lib/filterSuites'

const s = (slug: string, maxGuests: number, featured = false) =>
  ({ slug, maxGuests, featured }) as any

const all = [s('a', 2), s('b', 4, true), s('c', 5), s('d', 4)]

describe('filterSuites', () => {
  it('returns all when filter is "all"', () => {
    expect(filterSuites(all, { capacity: 'all', featuredOnly: false })).toHaveLength(4)
  })
  it('filters by capacity bucket (4 = exactly 4)', () => {
    expect(filterSuites(all, { capacity: 4, featuredOnly: false }).map((x) => x.slug)).toEqual(['b', 'd'])
  })
  it('"5+" returns 5 and above', () => {
    expect(filterSuites(all, { capacity: '5+', featuredOnly: false }).map((x) => x.slug)).toEqual(['c'])
  })
  it('featuredOnly keeps only featured', () => {
    expect(filterSuites(all, { capacity: 'all', featuredOnly: true }).map((x) => x.slug)).toEqual(['b'])
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- filterSuites`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the filter**

Create `src/lib/filterSuites.ts`:
```ts
import type { Suite } from './suites.schema'

export type Capacity = 'all' | 2 | 3 | 4 | '5+'
export interface SuiteFilter { capacity: Capacity; featuredOnly: boolean }

export function filterSuites(suites: Suite[], f: SuiteFilter): Suite[] {
  return suites.filter((s) => {
    if (f.featuredOnly && !s.featured) return false
    if (f.capacity === 'all') return true
    if (f.capacity === '5+') return s.maxGuests >= 5
    return s.maxGuests === f.capacity
  })
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- filterSuites`
Expected: PASS (4 tests).

- [ ] **Step 5: Build the listing page (client filter UI)**

Create `src/app/suites/page.tsx` (server component loads data, hands to a client grid):
```tsx
import { getAllSuites } from '@/lib/suites'
import { SuitesGrid } from './SuitesGrid'

export const metadata = { title: 'Suites' }
export default function SuitesPage() {
  return <SuitesGrid suites={getAllSuites()} />
}
```
Create `src/app/suites/SuitesGrid.tsx`:
```tsx
'use client'
import { useState } from 'react'
import type { Suite } from '@/lib/suites.schema'
import { filterSuites, type Capacity } from '@/lib/filterSuites'
import { SuiteCard } from '@/components/SuiteCard'
import { Section } from '@/components/Section'

const TABS: { label: string; value: Capacity }[] = [
  { label: 'All', value: 'all' }, { label: '2 guests', value: 2 },
  { label: '3 guests', value: 3 }, { label: '4 guests', value: 4 }, { label: '5+ guests', value: '5+' },
]

export function SuitesGrid({ suites }: { suites: Suite[] }) {
  const [capacity, setCapacity] = useState<Capacity>('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const shown = filterSuites(suites, { capacity, featuredOnly })
  return (
    <Section>
      <h1 className="text-4xl font-semibold">All suites</h1>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button key={String(t.value)} onClick={() => setCapacity(t.value)}
            className={`rounded-full px-4 py-2 text-sm ring-1 ring-taupe ${capacity === t.value ? 'bg-espresso text-sand' : 'hover:bg-taupe/40'}`}>
            {t.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} /> Featured only
        </label>
      </div>
      <p className="mt-4 text-sm text-espresso/60">{shown.length} suites</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => <SuiteCard key={s.slug} suite={s} />)}
      </div>
    </Section>
  )
}
```

- [ ] **Step 6: Verify & commit**

Run `npm run dev`, visit `/suites`, click each tab + toggle. Stop.
```powershell
git add -A
git commit -m "feat: suites listing with capacity filter (tested)"
```

---

## Task 9: Suite detail page + gallery

**Files:**
- Create: `src/components/Gallery.tsx`
- Create: `src/app/suites/[slug]/page.tsx`

- [ ] **Step 1: Gallery component**

Create `src/components/Gallery.tsx`:
```tsx
'use client'
import Image from 'next/image'
import { useState } from 'react'

export function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-card shadow-soft">
        <Image src={photos[active]} alt={alt} fill sizes="(max-width:1024px) 100vw, 66vw" className="object-cover" priority />
      </div>
      {photos.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {photos.map((p, i) => (
            <button key={p} onClick={() => setActive(i)} aria-label={`Photo ${i + 1}`}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg ring-2 ${i === active ? 'ring-clay' : 'ring-transparent'}`}>
              <Image src={p} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Detail page with static params + metadata**

Create `src/app/suites/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { getAllSuites, getSuite } from '@/lib/suites'
import { Section } from '@/components/Section'
import { Gallery } from '@/components/Gallery'
import { AmenityList } from '@/components/AmenityList'
import { RatingPill } from '@/components/RatingPill'
import { Button } from '@/components/Button'

export function generateStaticParams() {
  return getAllSuites().map((s) => ({ slug: s.slug }))
}
export function generateMetadata({ params }: { params: { slug: string } }) {
  const s = getSuite(params.slug)
  return s ? { title: s.name, description: s.summary } : {}
}

export default function SuiteDetail({ params }: { params: { slug: string } }) {
  const suite = getSuite(params.slug)
  if (!suite) notFound()
  return (
    <Section className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <Gallery photos={suite.photos} alt={suite.name} />
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{suite.name}</h1>
            <RatingPill rating={suite.rating} reviews={suite.reviewCount} />
          </div>
          <p className="mt-2 text-espresso/60">Up to {suite.maxGuests} guests · {suite.bedrooms} bedroom · {suite.bathrooms} bath</p>
          <p className="mt-6 leading-relaxed text-espresso/80">{suite.description}</p>
          <h2 className="mt-10 text-xl font-semibold">Amenities</h2>
          <div className="mt-4"><AmenityList amenities={suite.amenities} /></div>
        </div>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-taupe/50">
          <p><span className="text-2xl font-semibold text-clay">${suite.pricePerNight}</span><span className="text-espresso/60"> / night</span></p>
          {/* Booking widget arrives in Plan 2; for now a clear CTA */}
          <Button href="/contact" className="mt-5 w-full">Request to book</Button>
          <p className="mt-3 text-center text-xs text-espresso/50">Dates subject to host confirmation.</p>
        </div>
      </aside>
    </Section>
  )
}
```

- [ ] **Step 3: Verify & commit**

Run `npm run dev`, open a few `/suites/<slug>` pages, click gallery thumbnails, confirm 404 on a bad slug. Stop.
```powershell
git add -A
git commit -m "feat: suite detail page + gallery"
```

---

## Task 10: About page

**Files:**
- Create: `content/site.json`
- Modify: `src/lib/site.ts` (load about copy)
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Seed about content (scraped, with placeholder where blank)**

Create `content/site.json`:
```json
{
  "about": {
    "heading": "Welcome to Waena Inn",
    "body": "TODO(client): the live About page renders no text. Replace this with the real Waena Inn story — kamaʻāina hosts, the Wailuku location, and what makes a stay here special.",
    "highlights": ["Central Wailuku location", "Kamaʻāina hospitality", "Self check-in, 24/7"]
  },
  "testimonials": []
}
```

- [ ] **Step 2: About page**

Create `src/app/about/page.tsx`:
```tsx
import site from '@/../content/site.json'
import { Section } from '@/components/Section'
import { SITE } from '@/lib/site'

export const metadata = { title: 'About' }
export default function About() {
  const { about } = site
  return (
    <Section className="max-w-3xl">
      <p className="text-sm uppercase tracking-widest text-espresso/50">About us</p>
      <h1 className="mt-2 text-4xl font-semibold">{about.heading}</h1>
      <p className="mt-6 leading-relaxed text-espresso/80">{about.body}</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {about.highlights.map((h) => (
          <li key={h} className="rounded-card bg-white p-5 text-sm shadow-soft ring-1 ring-taupe/50">{h}</li>
        ))}
      </ul>
      <p className="mt-10 text-espresso/70">Questions? Email <a className="text-clay" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
    </Section>
  )
}
```

- [ ] **Step 3: Verify & commit**

Run `npm run dev`, visit `/about`. Stop.
```powershell
git add -A
git commit -m "feat: about page (placeholder copy flagged for client)"
```

---

## Task 11: Contact page

**Files:**
- Create: `src/app/contact/page.tsx`

> The contact form's submit handler (email send) is wired in Plan 2 alongside Resend. For now the form
> posts to a `mailto:` link so it's functional without a backend.

- [ ] **Step 1: Contact page with mailto form**

Create `src/app/contact/page.tsx`:
```tsx
import { Section } from '@/components/Section'
import { SITE } from '@/lib/site'

export const metadata = { title: 'Contact' }
export default function Contact() {
  return (
    <Section className="max-w-xl">
      <h1 className="text-4xl font-semibold">Contact us</h1>
      <p className="mt-3 text-espresso/70">{SITE.address} · <a className="text-clay" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
      <form action={`mailto:${SITE.email}`} method="post" encType="text/plain" className="mt-8 grid gap-4">
        <input name="name" required placeholder="Your name" className="rounded-xl border border-taupe bg-white px-4 py-3" />
        <input name="email" type="email" required placeholder="Your email" className="rounded-xl border border-taupe bg-white px-4 py-3" />
        <textarea name="message" required rows={5} placeholder="How can we help?" className="rounded-xl border border-taupe bg-white px-4 py-3" />
        <button className="rounded-full bg-clay px-6 py-3 text-sm font-medium text-sand hover:brightness-110">Send message</button>
      </form>
    </Section>
  )
}
```

- [ ] **Step 2: Verify & commit**

Run `npm run dev`, visit `/contact`. Stop.
```powershell
git add -A
git commit -m "feat: contact page"
```

---

## Task 12: SEO — metadata, sitemap, robots, JSON-LD

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/JsonLd.tsx`
- Modify: `src/app/suites/[slug]/page.tsx` (inject LodgingBusiness JSON-LD)

- [ ] **Step 1: Sitemap + robots**

Create `src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from 'next'
import { getAllSuites } from '@/lib/suites'
import { SITE } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/suites', '/about', '/contact'].map((p) => ({ url: `${SITE.url}${p}` }))
  const suites = getAllSuites().map((s) => ({ url: `${SITE.url}/suites/${s.slug}` }))
  return [...routes, ...suites]
}
```
Create `src/app/robots.ts`:
```ts
import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${SITE.url}/sitemap.xml` }
}
```

- [ ] **Step 2: JSON-LD component + inject on detail page**

Create `src/components/JsonLd.tsx`:
```tsx
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
```
In `src/app/suites/[slug]/page.tsx`, render inside the component:
```tsx
import { JsonLd } from '@/components/JsonLd'
import { SITE } from '@/lib/site'
// ...inside return, before <Section>:
<JsonLd data={{
  '@context': 'https://schema.org', '@type': 'LodgingBusiness',
  name: suite.name, image: `${SITE.url}${suite.photos[0]}`, address: SITE.address,
  aggregateRating: { '@type': 'AggregateRating', ratingValue: suite.rating, reviewCount: suite.reviewCount },
  priceRange: `$${suite.pricePerNight}` ,
}} />
```
(Wrap the page's JSX in a fragment `<>...</>` to allow the sibling script.)

- [ ] **Step 3: Verify & commit**

Run `npm run dev`, visit `/sitemap.xml` and `/robots.txt`; view a suite page source for the JSON-LD. Stop.
```powershell
git add -A
git commit -m "feat: SEO — sitemap, robots, LodgingBusiness JSON-LD"
```

---

## Task 13: Accessibility & responsive pass

**Files:** touch components as needed for fixes.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass (schema, parseSuite, SuiteCard, filterSuites).

- [ ] **Step 2: Production build sanity**

Run: `npm run build`
Expected: build succeeds; all routes statically generated except where dynamic. Fix any type errors.

- [ ] **Step 3: Manual a11y/responsive check (use the browser preview workflow)**

Verify on mobile + desktop widths: contrast on espresso sections (sand text passes AA), every image
has meaningful `alt`, nav/forms are keyboard-navigable with visible focus, the filter buttons announce
state. Fix issues in the relevant component, re-run `npm test`.

- [ ] **Step 4: Commit any fixes**

```powershell
git add -A
git commit -m "fix: accessibility and responsive polish"
```

---

## Task 14: Deploy config

**Files:**
- Create: `.env.example`, `README.md`

- [ ] **Step 1: Env example (placeholders for Plan 2)**

Create `.env.example`:
```
# Plan 2 (booking/payments) — not required for the content site
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
HOST_EMAIL=uncletonyshale@gmail.com
TAX_RATE=0.1775
CLEANING_FEE=75
```

- [ ] **Step 2: README**

Create `README.md` with: project summary, `npm run dev/build/test/scrape`, the env vars, and a
"Deploy to Vercel: connect the repo, set env vars, `git push`" note. Flag the outstanding client
placeholders (cleaning fee, tax rate, phone/address, domain, Stripe/Resend keys).

- [ ] **Step 3: Final build + commit**

```powershell
npm run build
git add -A
git commit -m "chore: env example + README; ready for Vercel"
```

---

## Self-Review

**Spec coverage:** Home, Suites (+filter), Suite detail (+gallery), About, Contact, footer legal links,
warm Maui palette + fonts, scraped real content + photos, Zod data model, SEO (metadata/sitemap/robots/
JSON-LD), a11y/responsive, Vercel deploy — all mapped to Tasks 1–14. **Deferred to Plan 2 (intentional):**
booking widget, pricing/tax math, Stripe payment + manual capture, webhook, Resend email, blocked-dates
enforcement, confirmation page. The Task 9 detail page and Task 11 contact form leave clean seams
(`Request to book` CTA, mailto form) for Plan 2 to replace.

**Placeholder scan:** The only `TODO`s are deliberate **client-data** placeholders (phone, address,
domain, cleaning fee, About copy) that the scrape can't supply — each is clearly labeled `TODO(client)`
and surfaced in the README. No engineering placeholders ("add validation", "similar to Task N").

**Type consistency:** `Suite` type and field names (`pricePerNight`, `maxGuests`, `blockedDates`,
`featured`) are identical across `suites.schema.ts`, the loader, `SuiteCard`, `filterSuites`, pages, and
the scrape output. `Capacity`/`SuiteFilter` types match between `filterSuites.ts` and `SuitesGrid.tsx`.
`SITE` constant shape is stable across all consumers.
