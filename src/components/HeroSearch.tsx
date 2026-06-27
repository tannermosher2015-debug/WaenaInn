'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** Hero date + guest picker. Routes to /suites, carrying guests as a capacity pre-filter. */
export function HeroSearch({ maxGuests = 6 }: { maxGuests?: number }) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  function search() {
    const params = new URLSearchParams()
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    params.set('guests', String(guests))
    router.push(`/suites?${params.toString()}`)
  }

  const labelCls = 'block text-[0.66rem] font-medium uppercase tracking-[0.18em] text-espresso/55'
  const inputCls =
    'mt-1 w-full bg-transparent text-sm text-espresso outline-none placeholder:text-espresso/40'

  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-card bg-paper/95 shadow-soft ring-1 ring-line backdrop-blur sm:flex-row sm:items-stretch sm:divide-x sm:divide-line">
      <label className="flex-1 px-5 py-3.5">
        <span className={labelCls}>Check-in</span>
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} />
      </label>
      <label className="flex-1 px-5 py-3.5">
        <span className={labelCls}>Check-out</span>
        <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
      </label>
      <label className="px-5 py-3.5 sm:w-28">
        <span className={labelCls}>Guests</span>
        <input
          type="number"
          min={1}
          max={maxGuests}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className={inputCls}
        />
      </label>
      <button
        onClick={search}
        className="group flex items-center justify-center gap-2 bg-espresso px-7 py-4 text-sm font-medium tracking-wide text-sand transition-colors duration-300 hover:bg-clay sm:py-0"
      >
        Find a suite
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
      </button>
    </div>
  )
}
