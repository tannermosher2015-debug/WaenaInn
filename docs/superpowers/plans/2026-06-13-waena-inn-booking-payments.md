# Waena Inn — Plan 2: Booking & Payments

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** Plan 1 (Foundation & Content Site) is complete and committed.

**Goal:** Add a real online booking flow — date/guest selection with a live price breakdown (nights + cleaning + Hawaii taxes), Stripe card payment with **authorize-now / capture-on-confirm**, a webhook that records the booking and emails the host, and a guest confirmation page.

**Architecture:** Pure, unit-tested pricing + date modules in `lib/`. A client booking widget on the suite page collects dates/guests and hands a quote to a Stripe-powered checkout page (Payment Element). A server route creates a `PaymentIntent` with `capture_method: 'manual'`; a webhook verifies the event, records the booking, and emails the host via Resend. No database — Stripe holds the record, email notifies the host, the host captures/cancels from the Stripe dashboard.

**Tech Stack (added):** `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`, `resend`, `date-fns`.

**Reference spec:** `docs/superpowers/specs/2026-06-13-waena-inn-redesign-design.md`

---

## File Structure (additions)

```
src/
├─ lib/
│  ├─ pricing.ts            # quote math (pure, tested)
│  ├─ pricing.test-types... # types reused by widget + checkout
│  ├─ dates.ts              # nights, blocked-date checks, validation (pure, tested)
│  └─ stripe.ts             # server Stripe client
├─ components/
│  └─ BookingWidget.tsx     # date + guest picker, live breakdown (client)
├─ app/
│  ├─ api/
│  │  ├─ checkout/route.ts          # POST → create PaymentIntent (manual capture)
│  │  ├─ stripe/webhook/route.ts    # POST → verify, record, email host
│  │  └─ contact/route.ts           # POST → email host (replaces mailto)
│  └─ book/[slug]/
│     ├─ page.tsx                   # checkout: Payment Element
│     └─ confirmed/page.tsx         # guest confirmation
└─ emails/
   ├─ bookingRequest.ts             # host notification text/html
   └─ send.ts                       # Resend wrapper
tests/
├─ pricing.test.ts
└─ dates.test.ts
```

---

## Task 1: Pricing math — TDD

**Files:**
- Create: `src/lib/pricing.ts`
- Test: `tests/pricing.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/pricing.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { quote } from '@/lib/pricing'

describe('quote', () => {
  it('computes nights × rate + cleaning + tax', () => {
    const q = quote({ pricePerNight: 100, cleaningFee: 75, nights: 3, taxRate: 0.1775 })
    // subtotal 300 + cleaning 75 = 375; tax = 375 * 0.1775 = 66.56; total = 441.56
    expect(q.subtotal).toBe(300)
    expect(q.cleaningFee).toBe(75)
    expect(q.taxableBase).toBe(375)
    expect(q.tax).toBe(66.56)
    expect(q.total).toBe(441.56)
    expect(q.amountCents).toBe(44156)
  })
  it('rounds tax to cents (half-up)', () => {
    const q = quote({ pricePerNight: 99.99, cleaningFee: 0, nights: 1, taxRate: 0.1775 })
    expect(q.tax).toBe(17.75) // 99.99 * 0.1775 = 17.748 → 17.75
  })
  it('throws on zero nights', () => {
    expect(() => quote({ pricePerNight: 100, cleaningFee: 0, nights: 0, taxRate: 0.1775 })).toThrow()
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- pricing`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/pricing.ts`:
```ts
export interface QuoteInput { pricePerNight: number; cleaningFee: number; nights: number; taxRate: number }
export interface Quote {
  nights: number; subtotal: number; cleaningFee: number; taxableBase: number
  taxRate: number; tax: number; total: number; amountCents: number
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export function quote({ pricePerNight, cleaningFee, nights, taxRate }: QuoteInput): Quote {
  if (nights < 1) throw new Error('nights must be >= 1')
  const subtotal = round2(pricePerNight * nights)
  const taxableBase = round2(subtotal + cleaningFee)
  const tax = round2(taxableBase * taxRate)
  const total = round2(taxableBase + tax)
  return { nights, subtotal, cleaningFee, taxableBase, taxRate, tax, total, amountCents: Math.round(total * 100) }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- pricing`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: pricing quote math with Hawaii tax (tested)"
```

---

## Task 2: Date helpers — TDD

**Files:**
- Create: `src/lib/dates.ts`
- Test: `tests/dates.test.ts`

- [ ] **Step 1: Install date-fns + write failing test**

Run: `npm i date-fns`

Create `tests/dates.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { nightsBetween, rangeHasBlocked, validateStay } from '@/lib/dates'

describe('dates', () => {
  it('counts nights', () => {
    expect(nightsBetween('2026-07-01', '2026-07-04')).toBe(3)
  })
  it('detects a blocked date inside the range', () => {
    expect(rangeHasBlocked('2026-07-01', '2026-07-04', ['2026-07-02'])).toBe(true)
    expect(rangeHasBlocked('2026-07-01', '2026-07-04', ['2026-07-09'])).toBe(false)
  })
  it('validateStay rejects checkout <= checkin', () => {
    expect(validateStay({ checkIn: '2026-07-04', checkOut: '2026-07-04', guests: 2, maxGuests: 4, blocked: [] }).ok).toBe(false)
  })
  it('validateStay rejects too many guests', () => {
    expect(validateStay({ checkIn: '2026-07-01', checkOut: '2026-07-03', guests: 9, maxGuests: 4, blocked: [] }).ok).toBe(false)
  })
  it('validateStay accepts a clean range', () => {
    expect(validateStay({ checkIn: '2026-07-01', checkOut: '2026-07-03', guests: 2, maxGuests: 4, blocked: [] }).ok).toBe(true)
  })
})
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npm test -- dates`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `src/lib/dates.ts`:
```ts
import { differenceInCalendarDays, eachDayOfInterval, parseISO, formatISO } from 'date-fns'

export const nightsBetween = (checkIn: string, checkOut: string) =>
  differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn))

export function rangeHasBlocked(checkIn: string, checkOut: string, blocked: string[]): boolean {
  if (!blocked.length) return false
  const set = new Set(blocked)
  // nights are checkIn .. checkOut-1
  return eachDayOfInterval({ start: parseISO(checkIn), end: parseISO(checkOut) })
    .slice(0, -1)
    .some((d) => set.has(formatISO(d, { representation: 'date' })))
}

export interface StayInput { checkIn: string; checkOut: string; guests: number; maxGuests: number; blocked: string[] }
export function validateStay(s: StayInput): { ok: boolean; error?: string } {
  if (!s.checkIn || !s.checkOut) return { ok: false, error: 'Select dates' }
  if (nightsBetween(s.checkIn, s.checkOut) < 1) return { ok: false, error: 'Check-out must be after check-in' }
  if (s.guests < 1 || s.guests > s.maxGuests) return { ok: false, error: `Max ${s.maxGuests} guests` }
  if (rangeHasBlocked(s.checkIn, s.checkOut, s.blocked)) return { ok: false, error: 'Some dates are unavailable' }
  return { ok: true }
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `npm test -- dates`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: date/stay validation helpers (tested)"
```

---

## Task 3: Booking widget on the suite page

**Files:**
- Create: `src/components/BookingWidget.tsx`
- Modify: `src/app/suites/[slug]/page.tsx` (replace the Plan 1 CTA with the widget)

- [ ] **Step 1: Build the widget**

Create `src/components/BookingWidget.tsx`:
```tsx
'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Suite } from '@/lib/suites.schema'
import { validateStay, nightsBetween } from '@/lib/dates'
import { quote } from '@/lib/pricing'

const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? '0.1775')

export function BookingWidget({ suite }: { suite: Suite }) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  const valid = validateStay({ checkIn, checkOut, guests, maxGuests: suite.maxGuests, blocked: suite.blockedDates })
  const q = useMemo(() => {
    if (!valid.ok) return null
    return quote({ pricePerNight: suite.pricePerNight, cleaningFee: suite.cleaningFee, nights: nightsBetween(checkIn, checkOut), taxRate: TAX_RATE })
  }, [valid.ok, checkIn, checkOut, suite, guests])

  function proceed() {
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) })
    router.push(`/book/${suite.slug}?${params}`)
  }

  return (
    <div className="rounded-card bg-white p-6 shadow-soft ring-1 ring-taupe/50">
      <p><span className="text-2xl font-semibold text-clay">${suite.pricePerNight}</span><span className="text-espresso/60"> / night</span></p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-xs">Check-in
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="mt-1 w-full rounded-lg border border-taupe px-3 py-2" />
        </label>
        <label className="text-xs">Check-out
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="mt-1 w-full rounded-lg border border-taupe px-3 py-2" />
        </label>
      </div>
      <label className="mt-3 block text-xs">Guests
        <input type="number" min={1} max={suite.maxGuests} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-taupe px-3 py-2" />
      </label>

      {q && (
        <dl className="mt-5 space-y-2 border-t border-taupe pt-4 text-sm">
          <div className="flex justify-between"><dt>${suite.pricePerNight} × {q.nights} nights</dt><dd>${q.subtotal.toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt>Cleaning fee</dt><dd>${q.cleaningFee.toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt>Hawaii taxes</dt><dd>${q.tax.toFixed(2)}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Total</dt><dd>${q.total.toFixed(2)}</dd></div>
        </dl>
      )}

      <button onClick={proceed} disabled={!valid.ok}
        className="mt-5 w-full rounded-full bg-clay px-6 py-3 text-sm font-medium text-sand transition hover:brightness-110 disabled:opacity-40">
        Request to book
      </button>
      <p className="mt-2 text-center text-xs text-espresso/50">{valid.ok ? 'Card authorized, not charged until we confirm.' : valid.error ?? 'Select your dates'}</p>
    </div>
  )
}
```

- [ ] **Step 2: Swap the widget into the suite page**

In `src/app/suites/[slug]/page.tsx`, replace the `<aside>` contents from Plan 1 Task 9 with:
```tsx
import { BookingWidget } from '@/components/BookingWidget'
// inside <aside className="lg:sticky lg:top-24 lg:self-start">:
<BookingWidget suite={suite} />
```
Add `NEXT_PUBLIC_TAX_RATE` to `.env.example` / `.env.local` (e.g. `0.1775`).

- [ ] **Step 3: Verify & commit**

Run `npm run dev`, open a suite, pick dates → breakdown updates, button enables, and navigates to
`/book/<slug>?checkIn=...`. Stop.
```powershell
git add -A
git commit -m "feat: booking widget with live price breakdown"
```

---

## Task 4: Stripe server client + checkout route

**Files:**
- Create: `src/lib/stripe.ts`, `src/app/api/checkout/route.ts`

- [ ] **Step 1: Install Stripe + add env**

Run: `npm i stripe @stripe/stripe-js @stripe/react-stripe-js`

Add to `.env.local` (test keys from dashboard.stripe.com, test mode):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
TAX_RATE=0.1775
CLEANING_FEE=75
```

- [ ] **Step 2: Server Stripe client**

Create `src/lib/stripe.ts`:
```ts
import 'server-only'
import Stripe from 'stripe'
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' })
```

- [ ] **Step 3: Checkout route — server-recomputes the quote (never trust the client amount)**

Create `src/app/api/checkout/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getSuite } from '@/lib/suites'
import { quote } from '@/lib/pricing'
import { validateStay, nightsBetween } from '@/lib/dates'

const TAX_RATE = Number(process.env.TAX_RATE ?? '0.1775')

export async function POST(req: Request) {
  const { slug, checkIn, checkOut, guests, name, email, phone, message } = await req.json()
  const suite = getSuite(slug)
  if (!suite) return NextResponse.json({ error: 'Unknown suite' }, { status: 404 })

  const v = validateStay({ checkIn, checkOut, guests, maxGuests: suite.maxGuests, blocked: suite.blockedDates })
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const q = quote({ pricePerNight: suite.pricePerNight, cleaningFee: suite.cleaningFee, nights: nightsBetween(checkIn, checkOut), taxRate: TAX_RATE })

  const pi = await stripe.paymentIntents.create({
    amount: q.amountCents,
    currency: 'usd',
    capture_method: 'manual', // authorize now, capture on host confirmation
    receipt_email: email,
    description: `Booking request — ${suite.name}`,
    metadata: { slug, suite: suite.name, checkIn, checkOut, guests: String(guests), name, email, phone: phone ?? '', message: message ?? '', total: q.total.toFixed(2) },
  })
  return NextResponse.json({ clientSecret: pi.client_secret, amount: q.total })
}
```

- [ ] **Step 4: Verify & commit**

Run `npm run dev`; POST a sample body with curl/Thunder and confirm a `clientSecret` returns and the
PaymentIntent appears in the Stripe **test** dashboard with status "requires_payment_method". Then:
```powershell
git add -A
git commit -m "feat: Stripe checkout route (manual capture, server-side quote)"
```

---

## Task 5: Checkout page (Payment Element)

**Files:**
- Create: `src/app/book/[slug]/page.tsx`, `src/app/book/[slug]/CheckoutForm.tsx`

- [ ] **Step 1: Checkout server page reads params + suite**

Create `src/app/book/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import { getSuite } from '@/lib/suites'
import { Section } from '@/components/Section'
import { CheckoutForm } from './CheckoutForm'

export const metadata = { title: 'Checkout' }
export default function BookPage({ params, searchParams }:
  { params: { slug: string }; searchParams: { checkIn?: string; checkOut?: string; guests?: string } }) {
  const suite = getSuite(params.slug)
  if (!suite) notFound()
  const { checkIn = '', checkOut = '', guests = '2' } = searchParams
  return (
    <Section className="max-w-lg">
      <h1 className="text-3xl font-semibold">Request to book</h1>
      <p className="mt-2 text-espresso/60">{suite.name} · {checkIn} → {checkOut} · {guests} guests</p>
      <CheckoutForm slug={suite.slug} checkIn={checkIn} checkOut={checkOut} guests={Number(guests)} />
    </Section>
  )
}
```

- [ ] **Step 2: Client checkout form (collect guest info → create PI → Payment Element → confirm)**

Create `src/app/book/[slug]/CheckoutForm.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function CheckoutForm(props: { slug: string; checkIn: string; checkOut: string; guests: number }) {
  const [clientSecret, setClientSecret] = useState<string>()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [err, setErr] = useState<string>()

  async function startPayment(e: React.FormEvent) {
    e.preventDefault()
    setErr(undefined)
    const res = await fetch('/api/checkout', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...props, ...form }),
    })
    const data = await res.json()
    if (!res.ok) return setErr(data.error ?? 'Could not start checkout')
    setClientSecret(data.clientSecret)
  }

  if (!clientSecret) {
    return (
      <form onSubmit={startPayment} className="mt-6 grid gap-3">
        {(['name', 'email', 'phone'] as const).map((f) => (
          <input key={f} required={f !== 'phone'} type={f === 'email' ? 'email' : 'text'} placeholder={f[0].toUpperCase() + f.slice(1)}
            value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })}
            className="rounded-xl border border-taupe bg-white px-4 py-3" />
        ))}
        <textarea placeholder="Anything we should know?" value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-xl border border-taupe bg-white px-4 py-3" />
        {err && <p className="text-sm text-red-700">{err}</p>}
        <button className="rounded-full bg-clay px-6 py-3 text-sm font-medium text-sand hover:brightness-110">Continue to payment</button>
      </form>
    )
  }
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'flat' } }}>
      <PayStep slug={props.slug} />
    </Elements>
  )
}

function PayStep({ slug }: { slug: string }) {
  const stripe = useStripe(); const elements = useElements()
  const [busy, setBusy] = useState(false); const [err, setErr] = useState<string>()
  async function pay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setBusy(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/book/${slug}/confirmed` },
    })
    if (error) { setErr(error.message); setBusy(false) }
  }
  return (
    <form onSubmit={pay} className="mt-6 grid gap-4">
      <PaymentElement />
      {err && <p className="text-sm text-red-700">{err}</p>}
      <button disabled={busy} className="rounded-full bg-clay px-6 py-3 text-sm font-medium text-sand hover:brightness-110 disabled:opacity-40">
        {busy ? 'Authorizing…' : 'Authorize card'}
      </button>
      <p className="text-center text-xs text-espresso/50">Your card is authorized now and only charged once we confirm your dates.</p>
    </form>
  )
}
```

- [ ] **Step 3: Verify & commit**

Run `npm run dev`; complete the flow with Stripe test card `4242 4242 4242 4242`, any future expiry/CVC.
Confirm redirect to `/book/<slug>/confirmed` and a PaymentIntent in test dashboard with status
"requires_capture". Then:
```powershell
git add -A
git commit -m "feat: checkout page with Stripe Payment Element"
```

---

## Task 6: Confirmation page

**Files:**
- Create: `src/app/book/[slug]/confirmed/page.tsx`

- [ ] **Step 1: Build it**

Create `src/app/book/[slug]/confirmed/page.tsx`:
```tsx
import Link from 'next/link'
import { Section } from '@/components/Section'

export const metadata = { title: 'Request received' }
export default function Confirmed() {
  return (
    <Section className="max-w-lg text-center">
      <div className="rounded-card bg-white p-10 shadow-soft ring-1 ring-taupe/50">
        <h1 className="text-3xl font-semibold">Request received 🌺</h1>
        <p className="mt-4 text-espresso/70">Your card is authorized but <strong>not charged</strong>. We'll confirm your dates by email shortly — your card is only charged once we confirm.</p>
        <Link href="/suites" className="mt-8 inline-flex rounded-full bg-clay px-6 py-3 text-sm font-medium text-sand hover:brightness-110">Browse more suites</Link>
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Verify & commit**

Run `npm run dev`, visit the page directly. Stop.
```powershell
git add -A
git commit -m "feat: booking confirmation page"
```

---

## Task 7: Webhook — record + email host (Resend)

**Files:**
- Create: `src/emails/send.ts`, `src/emails/bookingRequest.ts`, `src/app/api/stripe/webhook/route.ts`

- [ ] **Step 1: Install Resend + email wrapper**

Run: `npm i resend`

Create `src/emails/send.ts`:
```ts
import 'server-only'
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  return resend.emails.send({ from: 'Waena Inn <bookings@waenainn.com>', ...opts })
}
```

- [ ] **Step 2: Email template**

Create `src/emails/bookingRequest.ts`:
```ts
export function bookingRequestEmail(m: Record<string, string>): string {
  return `
    <h2>New booking request — ${m.suite}</h2>
    <ul>
      <li><b>Dates:</b> ${m.checkIn} → ${m.checkOut}</li>
      <li><b>Guests:</b> ${m.guests}</li>
      <li><b>Total (authorized):</b> $${m.total}</li>
      <li><b>Name:</b> ${m.name}</li>
      <li><b>Email:</b> ${m.email}</li>
      <li><b>Phone:</b> ${m.phone || '—'}</li>
      <li><b>Message:</b> ${m.message || '—'}</li>
    </ul>
    <p>The card is <b>authorized, not charged</b>. Open Stripe → capture to confirm, or cancel to release.</p>`
}
```

- [ ] **Step 3: Webhook route (verify signature, email host on auth success)**

Create `src/app/api/stripe/webhook/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sendEmail } from '@/emails/send'
import { bookingRequestEmail } from '@/emails/bookingRequest'

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!
  const body = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'bad signature' }, { status: 400 })
  }
  if (event.type === 'payment_intent.amount_capturable_updated') {
    const pi = event.data.object as any
    const m = pi.metadata ?? {}
    await sendEmail({
      to: process.env.HOST_EMAIL!,
      subject: `Booking request — ${m.suite} (${m.checkIn}→${m.checkOut})`,
      html: bookingRequestEmail(m),
    })
  }
  return NextResponse.json({ received: true })
}
```
> `payment_intent.amount_capturable_updated` fires when a manual-capture PI is successfully authorized —
> exactly the moment to notify the host.

- [ ] **Step 4: Test the webhook locally with the Stripe CLI**

Run (separate terminals): `stripe listen --forward-to localhost:3000/api/stripe/webhook` (copy the
printed `whsec_...` into `.env.local`), then complete a test booking. Expected: CLI shows the event
delivered 200, and the host email arrives (use a Resend test/api key; if domain unverified, send to your
own address). Confirm in logs.

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: Stripe webhook → host email on authorization (Resend)"
```

---

## Task 8: Contact form → Resend (replace mailto)

**Files:**
- Create: `src/app/api/contact/route.ts`
- Modify: `src/app/contact/page.tsx` (post to the route)

- [ ] **Step 1: Contact API route**

Create `src/app/api/contact/route.ts`:
```ts
import { NextResponse } from 'next/server'
import { sendEmail } from '@/emails/send'

export async function POST(req: Request) {
  const { name, email, message } = await req.json()
  if (!name || !email || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  await sendEmail({
    to: process.env.HOST_EMAIL!,
    subject: `Website message from ${name}`,
    html: `<p><b>${name}</b> (${email}) wrote:</p><p>${message}</p>`,
  })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Convert the contact form to a client component posting JSON**

Replace `src/app/contact/page.tsx` form with a client component `ContactForm.tsx` that POSTs to
`/api/contact` and shows a success state:
```tsx
'use client'
import { useState } from 'react'
export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false); const [err, setErr] = useState<string>()
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(undefined)
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) })
    res.ok ? setSent(true) : setErr((await res.json()).error ?? 'Failed to send')
  }
  if (sent) return <p className="mt-8 rounded-card bg-white p-6 shadow-soft">Mahalo! We'll be in touch soon.</p>
  return (
    <form onSubmit={submit} className="mt-8 grid gap-4">
      <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-taupe bg-white px-4 py-3" />
      <input required type="email" placeholder="Your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border border-taupe bg-white px-4 py-3" />
      <textarea required rows={5} placeholder="How can we help?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-xl border border-taupe bg-white px-4 py-3" />
      {err && <p className="text-sm text-red-700">{err}</p>}
      <button className="rounded-full bg-clay px-6 py-3 text-sm font-medium text-sand hover:brightness-110">Send message</button>
    </form>
  )
}
```
Then render `<ContactForm />` in `contact/page.tsx` (remove the old `<form action="mailto:">`).

- [ ] **Step 3: Verify & commit**

Run `npm run dev`, submit the contact form, confirm the email arrives and the success state shows. Stop.
```powershell
git add -A
git commit -m "feat: contact form posts to Resend-backed API"
```

---

## Task 9: End-to-end verification & docs

- [ ] **Step 1: Full test suite + build**

Run: `npm test` (pricing, dates, plus Plan 1 tests) then `npm run build`.
Expected: all green; build succeeds.

- [ ] **Step 2: Full booking dry-run (test mode)**

With `stripe listen` running: book a suite end-to-end → confirmation page shows, PI is "requires_capture",
host email received. In the Stripe **test** dashboard, **capture** the PI (status → "succeeded") and
separately test **cancel** on another booking (authorization released). Document this host workflow in the README.

- [ ] **Step 3: Update README + .env.example**

Document the host capture/cancel workflow, the `stripe listen` dev step, the production webhook endpoint
(`/api/stripe/webhook`) to register in the Stripe dashboard, and confirm all env vars are listed. Note the
go-live checklist: swap test keys → live keys, verify the Resend sending domain, set the real `TAX_RATE`
and `CLEANING_FEE`.

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "docs: booking go-live checklist + host capture workflow"
```

---

## Self-Review

**Spec coverage:** Online card payment (Task 4–5), authorize-now/capture-on-confirm via
`capture_method: 'manual'` + host capture in dashboard (Task 4, 9), nightly + cleaning + Hawaii tax math
(Task 1), no-live-availability with blocked-date enforcement (Task 2 + widget validation), webhook record
+ host email (Task 7), guest confirmation (Task 6), contact email (Task 8), env-configured taxes/fees/keys.
All spec booking requirements mapped.

**Placeholder scan:** No engineering placeholders. Server **recomputes the quote** in the checkout route
rather than trusting the client amount (security). Remaining `TODO(client)` items are data/keys
(cleaning fee value, live Stripe + Resend keys, verified sending domain) surfaced in the README.

**Type consistency:** `Quote`/`QuoteInput` shared by widget + checkout route; `validateStay`/`StayInput`
shared by widget + route; `Suite` fields (`pricePerNight`, `cleaningFee`, `maxGuests`, `blockedDates`)
consistent with Plan 1's schema. PaymentIntent `metadata` keys written in Task 4 match exactly the keys
read in Task 7's email template (`suite`, `checkIn`, `checkOut`, `guests`, `total`, `name`, `email`,
`phone`, `message`).
