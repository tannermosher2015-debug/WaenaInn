'use client'

import { useMemo, useState } from 'react'
import { Suite } from '@/lib/suites.schema'
import { quote } from '@/lib/pricing'
import { validateStay, nightsBetween } from '@/lib/dates'
import { SITE } from '@/lib/site'

const TAX_RATE = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? '0.1775')

export function BookingWidget({ suite }: { suite: Suite }) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  const validation = validateStay({
    checkIn,
    checkOut,
    guests,
    maxGuests: suite.maxGuests,
    blocked: suite.blockedDates,
  })

  const q = useMemo(() => {
    if (!validation.ok || !checkIn || !checkOut) return null
    const nights = nightsBetween(checkIn, checkOut)
    if (nights < 1) return null
    try {
      return quote({
        pricePerNight: suite.pricePerNight,
        cleaningFee: suite.cleaningFee,
        nights,
        taxRate: TAX_RATE,
      })
    } catch {
      return null
    }
  }, [checkIn, checkOut, guests, validation.ok, suite.pricePerNight, suite.cleaningFee])

  const mailtoHref = useMemo(() => {
    if (!q || !validation.ok) return null
    const subject = `Booking request: ${suite.name}`
    const body = [
      `Suite: ${suite.name}`,
      `Check-in: ${checkIn}`,
      `Check-out: ${checkOut}`,
      `Guests: ${guests}`,
      `Nights: ${q.nights}`,
      '',
      '--- Price Breakdown ---',
      `$${suite.pricePerNight.toFixed(2)} × ${q.nights} night${q.nights !== 1 ? 's' : ''}: $${q.subtotal.toFixed(2)}`,
      `Cleaning fee: $${q.cleaningFee.toFixed(2)}`,
      `Hawaii taxes (${(TAX_RATE * 100).toFixed(2)}%): $${q.tax.toFixed(2)}`,
      `Total: $${q.total.toFixed(2)}`,
      '',
      '--- Your message ---',
      '',
    ].join('\n')
    return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [q, validation.ok, suite.name, suite.pricePerNight, checkIn, checkOut, guests])

  const btnBase =
    'mt-6 w-full inline-flex items-center justify-center gap-2 rounded-card px-6 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300'
  const btnPrimary = 'bg-espresso text-sand hover:bg-clay'
  const btnDisabled = 'bg-taupe text-espresso/40 cursor-not-allowed'
  const inputCls =
    'rounded-card border border-line bg-paper px-3 py-2.5 text-sm text-espresso focus:outline-none focus:ring-2 focus:ring-clay/40'
  const labelCls = 'text-[0.66rem] font-medium uppercase tracking-[0.16em] text-muted'

  return (
    <div className="rounded-card bg-paper p-6 shadow-soft ring-1 ring-line">
      {/* Price per night header */}
      <p className="flex items-baseline gap-1.5 border-b border-line pb-5">
        <span className="font-display text-3xl text-clay">${suite.pricePerNight.toFixed(2)}</span>
        <span className="text-sm uppercase tracking-widest text-muted">/ night</span>
      </p>

      {/* Date inputs */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Check-in</span>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Check-out</span>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      {/* Guests input */}
      <label className="mt-3 flex flex-col gap-1.5">
        <span className={labelCls}>Guests</span>
        <input
          type="number"
          min={1}
          max={suite.maxGuests}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className={inputCls}
        />
      </label>

      {/* Price breakdown */}
      {q && (
        <ul className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm text-espresso/80">
          <li className="flex justify-between">
            <span>
              ${suite.pricePerNight.toFixed(2)} × {q.nights} night{q.nights !== 1 ? 's' : ''}
            </span>
            <span>${q.subtotal.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Cleaning fee</span>
            <span>${q.cleaningFee.toFixed(2)}</span>
          </li>
          <li className="flex justify-between">
            <span>Hawaii taxes ({(TAX_RATE * 100).toFixed(2)}%)</span>
            <span>${q.tax.toFixed(2)}</span>
          </li>
          <li className="flex justify-between border-t border-line pt-2.5 font-display text-base text-espresso">
            <span>Total</span>
            <span>${q.total.toFixed(2)}</span>
          </li>
        </ul>
      )}

      {/* CTA */}
      {validation.ok && mailtoHref ? (
        <a href={mailtoHref} className={`${btnBase} ${btnPrimary}`}>
          Request to book
          <span aria-hidden>→</span>
        </a>
      ) : (
        <button disabled className={`${btnBase} ${btnDisabled}`}>
          Request to book
        </button>
      )}

      {/* Helper text */}
      <p className="mt-3 text-center text-xs text-muted">
        {validation.ok
          ? "Your dates aren't charged — we'll confirm by email. Secure online card payment is coming soon."
          : validation.error ?? 'Select your dates'}
      </p>
    </div>
  )
}
